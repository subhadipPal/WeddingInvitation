import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { guests, micRsvps } from '@/lib/schema'
import { eq } from 'drizzle-orm'

/** POST /api/mic-rsvp — public but requires a valid mic_token.
 *  Body: { mic_token, attending22?, attending23?, address?, note? }
 *  All fields optional (per Wireframes §A.6). Upserts on guest_id. */
export async function POST(req: NextRequest) {
  let body: {
    mic_token?: string
    attending22?: boolean | null
    attending23?: boolean | null
    address?: string | null
    note?: string | null
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const token = body.mic_token
  if (!token || typeof token !== 'string') {
    return NextResponse.json({ error: 'mic_token required' }, { status: 400 })
  }

  const guest = await db
    .select({ id: guests.id, invitedDays: guests.invitedDays })
    .from(guests)
    .where(eq(guests.micToken, token))
    .limit(1)

  if (!guest.length) {
    return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
  }
  // Only Berlin guests get MIC RSVPs. Day-28 guests are rejected defensively.
  if (guest[0].invitedDays === '28') {
    return NextResponse.json({ error: 'MIC RSVP not available for this guest' }, { status: 403 })
  }

  const payload = {
    attending22: body.attending22 ?? null,
    attending23: body.attending23 ?? null,
    address: body.address?.trim() || null,
    note: body.note?.trim() || null,
    updatedAt: new Date(),
  }

  const existing = await db
    .select()
    .from(micRsvps)
    .where(eq(micRsvps.guestId, guest[0].id))
    .limit(1)

  if (existing.length) {
    await db.update(micRsvps).set(payload).where(eq(micRsvps.guestId, guest[0].id))
  } else {
    await db.insert(micRsvps).values({ guestId: guest[0].id, ...payload })
  }
  return NextResponse.json({ ok: true })
}
