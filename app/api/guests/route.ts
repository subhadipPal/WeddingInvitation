import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { guests } from '@/lib/schema'
import { generateToken } from '@/lib/tokens'

export async function GET(req: NextRequest) {
  if (req.cookies.get('admin-auth')?.value !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const all = await db.select().from(guests).orderBy(guests.createdAt)
  return NextResponse.json({ guests: all })
}

export async function POST(req: NextRequest) {
  if (req.cookies.get('admin-auth')?.value !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
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
