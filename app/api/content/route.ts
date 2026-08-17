import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { content } from '@/lib/schema'
import { translations, GUEST_FACING_KEYS, type Lang } from '@/lib/i18n'

function isAdmin(req: NextRequest) {
  return req.cookies.get('admin-auth')?.value === process.env.ADMIN_PASSWORD
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await db.select().from(content)
  const result: Record<Lang, Record<string, string>> = {
    de: { ...Object.fromEntries(GUEST_FACING_KEYS.map(k => [k, translations.de[k]])) },
    en: { ...Object.fromEntries(GUEST_FACING_KEYS.map(k => [k, translations.en[k]])) },
  }
  for (const row of rows) {
    if (row.lang === 'de' || row.lang === 'en') {
      result[row.lang][row.key] = row.value
    }
  }
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { de: Record<string, string>; en: Record<string, string> }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const upserts: Promise<unknown>[] = []
  for (const lang of ['de', 'en'] as const) {
    for (const key of GUEST_FACING_KEYS) {
      const value = body[lang]?.[key]
      if (value === undefined) continue
      upserts.push(
        db.insert(content)
          .values({ key, lang, value })
          .onConflictDoUpdate({
            target: [content.key, content.lang],
            set: { value, updatedAt: new Date() },
          })
      )
    }
  }
  await Promise.all(upserts)
  return NextResponse.json({ ok: true })
}
