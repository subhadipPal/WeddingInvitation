import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { micImages } from '@/lib/schema'
import { MIC_IMAGE_SLOTS, type MicImageSlot, type MicImageVariant } from '@/lib/mic'

export const dynamic = 'force-dynamic'

/** GET /api/mic-images — unauthenticated. Returns URLs grouped by (slot, variant).
 *  Shape: { hero: { desktop: url, mobile: url, default: url }, day22Bg: { default: url }, ... }
 *  Keys/variants not uploaded are simply absent. The MIC page falls back to baked defaults. */
export async function GET() {
  const rows = await db.select().from(micImages)
  const result: Record<MicImageSlot, Partial<Record<MicImageVariant, string>>> = {} as never
  for (const slot of MIC_IMAGE_SLOTS) result[slot] = {}
  for (const row of rows) {
    if ((MIC_IMAGE_SLOTS as readonly string[]).includes(row.slot)) {
      result[row.slot as MicImageSlot][row.variant as MicImageVariant] = row.url
    }
  }
  return NextResponse.json(result)
}
