import { asc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { micFaqItems } from '@/lib/schema'
import { MIC_FAQ_DEFAULTS, type MicFaqItem } from '@/lib/mic'

/** Fetches all FAQ rows ordered by position. If the table is empty, seeds it
 *  with MIC_FAQ_DEFAULTS so first-time admins (and the guest page) see the
 *  original 5 FAQs. Shared between the admin API route and the guest page's
 *  server component. */
export async function getAllFaqItems(): Promise<MicFaqItem[]> {
  const rows = await db.select().from(micFaqItems).orderBy(asc(micFaqItems.position))
  if (rows.length > 0) return rows.map(toApi)

  // Empty table — seed defaults and return them.
  await db.insert(micFaqItems).values(MIC_FAQ_DEFAULTS).onConflictDoNothing()
  const seeded = await db.select().from(micFaqItems).orderBy(asc(micFaqItems.position))
  return seeded.map(toApi)
}

export function toApi(row: typeof micFaqItems.$inferSelect): MicFaqItem {
  return {
    id: row.id,
    position: row.position,
    title: row.title,
    body: row.body,
    isImportant: row.isImportant,
  }
}
