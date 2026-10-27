import { NextRequest, NextResponse } from 'next/server'
import { get } from '@vercel/blob'

// Public proxy for private-store blob images.
// ?url=<full-blob-url>  →  streams image bytes using get() with access:private
export async function GET(req: NextRequest) {
  const blobUrl = new URL(req.url).searchParams.get('url') ?? ''
  if (!blobUrl || !blobUrl.includes('blob.vercel-storage.com')) {
    return new NextResponse('Bad url', { status: 400 })
  }

  let result: Awaited<ReturnType<typeof get>>
  try {
    result = await get(blobUrl, { access: 'private' })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[mic-images/img] get() error:', msg)
    return new NextResponse('Not found', { status: 404 })
  }

  if (!result || result.statusCode !== 200 || !result.stream) {
    return new NextResponse('Not found', { status: 404 })
  }

  return new NextResponse(result.stream, {
    status: 200,
    headers: {
      'Content-Type': result.blob.contentType ?? 'image/jpeg',
      'Cache-Control': 'private, max-age=3600',
    },
  })
}
