import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { guests, rsvps } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const guest = await db.select().from(guests).where(eq(guests.token, token)).limit(1)
  if (!guest.length) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const rsvp = await db.select().from(rsvps).where(eq(rsvps.guestId, guest[0].id)).limit(1)
  return NextResponse.json({ guest: guest[0], rsvp: rsvp[0] ?? null })
}
