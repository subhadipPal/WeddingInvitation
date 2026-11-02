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
 *  Body: { action: 'reorder'; ids: string[] }.
 *  Writes `position` for each id in the order provided. Uses a two-phase
 *  update so a future UNIQUE(position) constraint wouldn't trip. */
export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { action?: unknown; ids?: unknown }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  if (body.action !== 'reorder' || !Array.isArray(body.ids) ||
      !body.ids.every(id => typeof id === 'string')) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
  const ids = body.ids as string[]

  const existing = await db.select({ id: micFaqItems.id }).from(micFaqItems)
  const knownIds = new Set(existing.map(r => r.id))
  if (ids.length !== knownIds.size || !ids.every(id => knownIds.has(id))) {
    return NextResponse.json({ error: 'ids do not match stored set' }, { status: 400 })
  }

  // Phase 1: push every row to a unique negative position to clear the way.
  const base = -1 - Date.now()
  for (let i = 0; i < ids.length; i++) {
    await db.update(micFaqItems).set({ position: base - i, updatedAt: new Date() })
      .where(eq(micFaqItems.id, ids[i]))
  }
  // Phase 2: assign final positions 0..N-1.
  for (let i = 0; i < ids.length; i++) {
    await db.update(micFaqItems).set({ position: i, updatedAt: new Date() })
      .where(eq(micFaqItems.id, ids[i]))
  }

  const refreshed = await db.select().from(micFaqItems).orderBy(asc(micFaqItems.position))
  return NextResponse.json({ items: refreshed.map(toApi) })
}
