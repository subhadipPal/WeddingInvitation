import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { micImages } from '@/lib/schema'
import { and, eq } from 'drizzle-orm'
import { isValidSlot, isValidVariantForSlot } from '@/lib/mic'

/** DELETE /api/mic-images/[slot]?variant=... — admin only.
 *  Removes a single (slot, variant) row from mic_images. Does NOT delete the
 *  blob file itself (defer to blob lifecycle rules). Missing ?variant= deletes
 *  the `default` variant. */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ slot: string }> },
) {
  if (req.cookies.get('admin-auth')?.value !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { slot } = await context.params
  const variant = new URL(req.url).searchParams.get('variant') ?? 'default'

  if (!isValidSlot(slot)) {
    return NextResponse.json({ error: `Unknown slot: ${slot}` }, { status: 400 })
  }
  if (!isValidVariantForSlot(slot, variant)) {
    return NextResponse.json({ error: `Invalid variant "${variant}" for slot "${slot}"` }, { status: 400 })
  }

  await db.delete(micImages).where(and(eq(micImages.slot, slot), eq(micImages.variant, variant)))
  return NextResponse.json({ ok: true })
}
