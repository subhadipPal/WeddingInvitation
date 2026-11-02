import { NextRequest, NextResponse } from 'next/server'
import { asc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { micFaqItems } from '@/lib/schema'
import { getAllFaqItems, toApi } from '@/lib/mic-faq'

export const dynamic = 'force-dynamic'

function isAdmin(req: NextRequest) {
  return req.cookies.get('admin-auth')?.value === process.env.ADMIN_PASSWORD
}

/** GET /api/mic-faq-items — admin only. Returns ordered FAQ items; seeds defaults
 *  on first call if the table is empty. */
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const items = await getAllFaqItems()
  return NextResponse.json({ items })
}

/** POST /api/mic-faq-items — admin only. Appends a new item at the end.
 *  Body: { title?: string; body?: string; isImportant?: boolean } (all optional). */
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let input: { title?: unknown; body?: unknown; isImportant?: unknown } = {}
  try { input = await req.json() } catch { /* empty body is fine */ }

  const title = typeof input.title === 'string' ? input.title : 'Neue Frage'
  const body = typeof input.body === 'string' ? input.body : ''
  const isImportant = input.isImportant === true

  const existing = await db.select({ position: micFaqItems.position }).from(micFaqItems)
  const nextPosition = existing.length
    ? Math.max(...existing.map(r => r.position)) + 1
    : 0

  const [row] = await db.insert(micFaqItems)
    .values({ position: nextPosition, title, body, isImportant })
    .returning()

  return NextResponse.json({ item: toApi(row) })
}

/** PATCH /api/mic-faq-items — admin only. Reorder helper.
 *  Body: { action: 'move'; id: string; direction: 'up' | 'down' }.
 *  Swaps position with the adjacent sibling (if any). */
export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { action?: unknown; id?: unknown; direction?: unknown }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  if (body.action !== 'move' || typeof body.id !== 'string' ||
      (body.direction !== 'up' && body.direction !== 'down')) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }

  const rows = await db.select().from(micFaqItems).orderBy(asc(micFaqItems.position))
  const idx = rows.findIndex(r => r.id === body.id)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const targetIdx = body.direction === 'up' ? idx - 1 : idx + 1
  if (targetIdx < 0 || targetIdx >= rows.length) {
    // At the edge — no-op, return current ordering.
    return NextResponse.json({ items: rows.map(toApi) })
  }

  const a = rows[idx]
  const b = rows[targetIdx]
  // Two-phase swap to dodge a potential future UNIQUE(position) constraint.
  const sentinel = -1 - Date.now() // guaranteed not to collide with real positions
  await db.update(micFaqItems).set({ position: sentinel, updatedAt: new Date() })
    .where(eq(micFaqItems.id, a.id))
  await db.update(micFaqItems).set({ position: a.position, updatedAt: new Date() })
    .where(eq(micFaqItems.id, b.id))
  await db.update(micFaqItems).set({ position: b.position, updatedAt: new Date() })
    .where(eq(micFaqItems.id, a.id))

  const refreshed = await db.select().from(micFaqItems).orderBy(asc(micFaqItems.position))
  return NextResponse.json({ items: refreshed.map(toApi) })
}
