import { NextRequest, NextResponse } from 'next/server'
import { head } from '@vercel/blob'

// Public proxy for private-store blob images.
// ?path=mic/hero/mobile.jpg  →  redirects to a signed download URL
export async function GET(req: NextRequest) {
  const path = new URL(req.url).searchParams.get('path') ?? ''
  if (!path.startsWith('mic/') || path.includes('..')) {
    return new NextResponse('Bad path', { status: 400 })
  }

  // Reconstruct the blob URL from the path — the store hostname is in BLOB_READ_WRITE_TOKEN
  // or we can derive it from BLOB_STORE_ID. Easiest: use head() to get the downloadUrl.
  const storeId = process.env.BLOB_STORE_ID
  if (!storeId) return new NextResponse('BLOB_STORE_ID not set', { status: 500 })

  // Private blob URLs follow: https://<storeId>.public.blob.vercel-storage.com/<path>
  const blobUrl = `https://${storeId}.public.blob.vercel-storage.com/${path}`

  try {
    const meta = await head(blobUrl)
    // Redirect to the signed downloadUrl (short-lived, safe to send to browser)
    return NextResponse.redirect(meta.downloadUrl, { status: 302 })
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }
}
