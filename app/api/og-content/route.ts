import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { content } from '@/lib/schema'
import { translations } from '@/lib/i18n'
import { inArray, eq } from 'drizzle-orm'

const OG_KEYS = ['ogTitle', 'ogSubtitle', 'ogDate', 'ogLocation'] as const

export const revalidate = 60

export async function GET() {
  const result = {
    ogTitle: translations.en.ogTitle,
    ogSubtitle: translations.en.ogSubtitle,
    ogDate: translations.en.ogDate,
    ogLocation: translations.en.ogLocation,
  }

  const rows = await db.select()
    .from(content)
    .where(inArray(content.key, [...OG_KEYS]))

  for (const row of rows) {
    if (row.lang === 'en' && row.key in result) {
      result[row.key as keyof typeof result] = row.value
    }
  }

  return NextResponse.json(result, {
    headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' },
  })
}
