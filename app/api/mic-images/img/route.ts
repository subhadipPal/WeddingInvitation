import { NextRequest, NextResponse } from 'next/server'
import { head } from '@vercel/blob'

// Public proxy for private-store blob images.
// ?url=<full-blob-url>  →  streams image bytes (avoids 403 on signed-URL redirect)
export async function GET(req: NextRequest) {
  const blobUrl = new URL(req.url).searchParams.get('url') ?? ''
  if (!blobUrl || !blobUrl.includes('blob.vercel-storage.com')) {
    return new NextResponse('Bad url', { status: 400 })
  }

  let downloadUrl: string
  try {
    const meta = await head(blobUrl)
    downloadUrl = meta.downloadUrl
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }

  // Fetch and stream bytes — avoids 403 that Vercel CDN returns when the browser
  // follows a 302 redirect to a signed URL (Referer mismatch / short TTL).
  const upstream = await fetch(downloadUrl)
  if (!upstream.ok) {
    return new NextResponse('Upstream error', { status: upstream.status })
  }

  const contentType = upstream.headers.get('content-type') ?? 'image/jpeg'
  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'private, max-age=3600',
    },
  })
}
