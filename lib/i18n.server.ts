import { db } from '@/lib/db'
import { content } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { translations, type Lang, type Translations } from '@/lib/i18n'

export async function loadTranslations(lang: Lang): Promise<Translations> {
  try {
    const rows = await db.select().from(content).where(eq(content.lang, lang))
    if (!rows.length) return translations[lang]
    const overrides: Partial<Translations> = {}
    for (const row of rows) {
      const key = row.key as keyof Translations
      if (key in translations[lang]) {
        overrides[key] = row.value
      }
    }
    return { ...translations[lang], ...overrides }
  } catch {
    return translations[lang]
  }
}
