import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { guests, rsvps } from '@/lib/schema'
import { generateToken } from '@/lib/tokens'
import { eq } from 'drizzle-orm'

function isAdmin(req: NextRequest) {
  return req.cookies.get('admin-auth')?.value === process.env.ADMIN_PASSWORD
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const all = await db.select().from(guests).orderBy(guests.createdAt)
  const rsvpRows = await db.select().from(rsvps)
  const rsvpMap = Object.fromEntries(rsvpRows.map(r => [r.guestId, r]))
  return NextResponse.json({ guests: all.map(g => ({ ...g, rsvp: rsvpMap[g.id] ?? null })) })
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name, email, phone, invitedDays } = await req.json()
  if (!name || !invitedDays) {
    return NextResponse.json({ error: 'name and invitedDays required' }, { status: 400 })
  }
  const token = generateToken()
  await db.insert(guests).values({ token, name, email, phone, invitedDays })
  const base = req.headers.get('origin') ?? ''
  return NextResponse.json({
    token,
    linkDe: `${base}/de/invite/${token}`,
    linkEn: `${base}/en/invite/${token}`,
  })
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  await db.delete(rsvps).where(eq(rsvps.guestId, id))
  await db.delete(guests).where(eq(guests.id, id))
  return NextResponse.json({ ok: true })
}
