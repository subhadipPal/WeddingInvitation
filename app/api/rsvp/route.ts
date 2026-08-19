import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { guests, rsvps } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  const { token, attending22, attending23, address, note } = await req.json()
  if (!token || attending23 === undefined) {
    return NextResponse.json({ error: 'token and attending23 required' }, { status: 400 })
  }
  const guest = await db.select().from(guests).where(eq(guests.token, token)).limit(1)
  if (!guest.length) {
    return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
  }
  const existing = await db.select().from(rsvps).where(eq(rsvps.guestId, guest[0].id)).limit(1)
  if (existing.length) {
    await db.update(rsvps)
      .set({ attending22: attending22 ?? null, attending23, address: address || null, note, updatedAt: new Date() })
      .where(eq(rsvps.guestId, guest[0].id))
  } else {
    await db.insert(rsvps).values({
      guestId: guest[0].id,
      attending22: attending22 ?? null,
      attending23,
      address: address || null,
      note,
    })
  }
  return NextResponse.json({ ok: true })
}
