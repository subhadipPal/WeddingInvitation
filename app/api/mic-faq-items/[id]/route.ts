import { NextRequest, NextResponse } from 'next/server'
import { asc, eq, gt } from 'drizzle-orm'
import { db } from '@/lib/db'
import { micFaqItems } from '@/lib/schema'

export const dynamic = 'force-dynamic'

function isAdmin(req: NextRequest) {
  return req.cookies.get('admin-auth')?.value === process.env.ADMIN_PASSWORD
}

/** PUT /api/mic-faq-items/:id — admin only. Partially updates a FAQ item.
 *  Body: { title?: string; body?: string; isImportant?: boolean }. */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  let body: { title?: unknown; body?: unknown; isImportant?: unknown }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const update: Partial<typeof micFaqItems.$inferInsert> = { updatedAt: new Date() }
  if (typeof body.title === 'string') update.title = body.title
  if (typeof body.body === 'string') update.body = body.body
  if (typeof body.isImportant === 'boolean') update.isImportant = body.isImportant

  const result = await db.update(micFaqItems).set(update)
    .where(eq(micFaqItems.id, id))
    .returning()

  if (!result.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}

/** DELETE /api/mic-faq-items/:id — admin only. Removes the item and compacts
 *  positions so there are no gaps. */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const target = await db.select().from(micFaqItems).where(eq(micFaqItems.id, id)).limit(1)
  if (!target.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.delete(micFaqItems).where(eq(micFaqItems.id, id))

  // Shift any later rows down by one so positions stay contiguous.
  const later = await db.select().from(micFaqItems)
    .where(gt(micFaqItems.position, target[0].position))
    .orderBy(asc(micFaqItems.position))
  for (const row of later) {
    await db.update(micFaqItems)
      .set({ position: row.position - 1, updatedAt: new Date() })
      .where(eq(micFaqItems.id, row.id))
  }

  return NextResponse.json({ ok: true })
}
