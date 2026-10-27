import { NextRequest, NextResponse } from 'next/server'
import { eq, and } from 'drizzle-orm'
import { del } from '@vercel/blob'
import { db } from '@/lib/db'
import { micImages } from '@/lib/schema'
import { MIC_IMAGE_SLOTS, isValidSlot, isValidVariantForSlot, type MicImageSlot, type MicImageVariant } from '@/lib/mic'

export const dynamic = 'force-dynamic'

function isAdmin(req: NextRequest) {
  return req.cookies.get('admin-auth')?.value === process.env.ADMIN_PASSWORD
}

/** GET /api/mic-images — admin only. Returns URLs grouped by (slot, variant). */
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

/** DELETE /api/mic-images?slot=hero&variant=mobile — admin only. */
export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const slot = url.searchParams.get('slot') ?? ''
  const variant = url.searchParams.get('variant') ?? 'default'

  if (!isValidSlot(slot)) return NextResponse.json({ error: `Unknown slot: ${slot}` }, { status: 400 })
  if (!isValidVariantForSlot(slot, variant)) return NextResponse.json({ error: 'Invalid variant' }, { status: 400 })

  // Find the row to get the blob URL before deleting
  const rows = await db.select().from(micImages)
    .where(and(eq(micImages.slot, slot as MicImageSlot), eq(micImages.variant, variant as MicImageVariant)))
  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const blobUrl = rows[0].url
  try {
    await del(blobUrl)
  } catch {
    // Blob may already be gone — continue to clean up DB row
  }

  await db.delete(micImages)
    .where(and(eq(micImages.slot, slot as MicImageSlot), eq(micImages.variant, variant as MicImageVariant)))

  return NextResponse.json({ ok: true })
}
