import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { content } from '@/lib/schema'
import { translations, GUEST_FACING_KEYS, HINDU_GUEST_FACING_KEYS, type Lang } from '@/lib/i18n'

function isAdmin(req: NextRequest) {
  return req.cookies.get('admin-auth')?.value === process.env.ADMIN_PASSWORD
}

// Berlin invite content is edited in DE + EN; Hindu invite content in EN + BN.
const EDITABLE_KEYS = [...GUEST_FACING_KEYS, ...HINDU_GUEST_FACING_KEYS]
const EDITABLE_LANGS = ['de', 'en', 'bn'] as const

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await db.select().from(content)
  const result: Record<Lang, Record<string, string>> = {
    de: { ...Object.fromEntries(EDITABLE_KEYS.map(k => [k, translations.de[k]])) },
    en: { ...Object.fromEntries(EDITABLE_KEYS.map(k => [k, translations.en[k]])) },
    bn: { ...Object.fromEntries(EDITABLE_KEYS.map(k => [k, translations.bn[k]])) },
  }
  for (const row of rows) {
    if (row.lang === 'de' || row.lang === 'en' || row.lang === 'bn') {
      result[row.lang][row.key] = row.value
    }
  }
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: Partial<Record<Lang, Record<string, string>>>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const upserts: Promise<unknown>[] = []
  for (const lang of EDITABLE_LANGS) {
    for (const key of EDITABLE_KEYS) {
      const value = body[lang]?.[key]
      if (typeof value !== 'string') continue
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
