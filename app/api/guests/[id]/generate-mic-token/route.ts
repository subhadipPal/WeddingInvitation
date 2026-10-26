import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { guests } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { generateMicToken } from '@/lib/mic'

/** POST /api/guests/[id]/generate-mic-token — admin only.
 *  Generates a 12-char token, writes to guests.mic_token for the given guest.
 *  Rejects day-28 (Kolkata) guests — MIC is Berlin-only. Idempotent only in the
 *  sense that re-calling it ROTATES the token (admin can regenerate if a link leaks).
 *  Returns { mic_token }. */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (req.cookies.get('admin-auth')?.value !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await context.params
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const rows = await db
    .select({ id: guests.id, invitedDays: guests.invitedDays })
    .from(guests)
    .where(eq(guests.id, id))
    .limit(1)

  if (!rows.length) {
    return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
  }
  if (rows[0].invitedDays === '28') {
    return NextResponse.json(
      { error: 'MIC links are not available for Kolkata-only guests' },
      { status: 400 },
    )
  }

  // Retry on the (astronomically unlikely) UNIQUE collision.
  let micToken = generateMicToken()
  for (let i = 0; i < 3; i++) {
    try {
      await db.update(guests).set({ micToken }).where(eq(guests.id, id))
      return NextResponse.json({ mic_token: micToken })
    } catch (err: unknown) {
      // Postgres unique violation code is 23505. If somehow collides, regenerate.
      const code = (err as { code?: string })?.code
      if (code !== '23505') throw err
      micToken = generateMicToken()
    }
  }
  return NextResponse.json({ error: 'Token collision — try again' }, { status: 500 })
}
