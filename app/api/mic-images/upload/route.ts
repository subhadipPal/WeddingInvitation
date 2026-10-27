import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import sharp from 'sharp'
import { db } from '@/lib/db'
import { micImages } from '@/lib/schema'
import { isValidSlot, isValidVariantForSlot, type MicImageSlot, type MicImageVariant } from '@/lib/mic'

function isAdmin(req: NextRequest) {
  return req.cookies.get('admin-auth')?.value === process.env.ADMIN_PASSWORD
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const slot = url.searchParams.get('slot') ?? ''
  const variant = url.searchParams.get('variant') ?? 'default'

  if (!isValidSlot(slot)) {
    return NextResponse.json({ error: `Unknown slot: ${slot}` }, { status: 400 })
  }
  if (!isValidVariantForSlot(slot, variant)) {
    return NextResponse.json({ error: `Variant "${variant}" is not valid for slot "${slot}"` }, { status: 400 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Could not parse multipart body' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: 'No file field in form data' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  // Resize to ≤1600px wide, convert to JPEG q=82
  let processed: Buffer
  try {
    processed = await sharp(buffer)
      .resize({ width: 1600, withoutEnlargement: true })
      .jpeg({ quality: 82 })
      .toBuffer()
  } catch {
    return NextResponse.json({ error: 'Image processing failed — ensure file is a valid image' }, { status: 422 })
  }

  const blobPath = `mic/${slot}/${variant}.jpg`
  let blobUrl: string
  try {
    const result = await put(blobPath, processed, {
      access: 'public',
      contentType: 'image/jpeg',
      addRandomSuffix: false,
    })
    blobUrl = result.url
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Blob upload error:', msg)
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: 'BLOB_READ_WRITE_TOKEN not configured in this environment' }, { status: 502 })
    }
    return NextResponse.json({ error: `Blob upload failed: ${msg}` }, { status: 502 })
  }

  // Upsert mic_images row
  await db
    .insert(micImages)
    .values({ slot: slot as MicImageSlot, variant: variant as MicImageVariant, url: blobUrl })
    .onConflictDoUpdate({
      target: [micImages.slot, micImages.variant],
      set: { url: blobUrl, uploadedAt: new Date() },
    })

  return NextResponse.json({ ok: true, url: blobUrl })
}
