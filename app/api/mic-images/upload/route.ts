import { NextRequest, NextResponse } from 'next/server'

/** POST /api/mic-images/upload — admin only. Implemented in PR C.
 *  Returns 501 Not Implemented in PR A so the admin UI can detect lack-of-support
 *  gracefully and the client code is wired up ready for PR C. */
export async function POST(req: NextRequest) {
  if (req.cookies.get('admin-auth')?.value !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json(
    { error: 'Image upload lands in PR C (needs @vercel/blob + sharp).' },
    { status: 501 },
  )
}
