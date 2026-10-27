import { NextRequest, NextResponse } from 'next/server'
import { head } from '@vercel/blob'

// Public proxy for private-store blob images.
// ?url=<full-blob-url>  →  redirects to a signed download URL
export async function GET(req: NextRequest) {
  const blobUrl = new URL(req.url).searchParams.get('url') ?? ''
  if (!blobUrl || !blobUrl.includes('blob.vercel-storage.com')) {
    return new NextResponse('Bad url', { status: 400 })
  }

  try {
    const meta = await head(blobUrl)
    return NextResponse.redirect(meta.downloadUrl, { status: 302 })
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }
}
