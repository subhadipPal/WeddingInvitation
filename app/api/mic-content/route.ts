import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { micContent } from '@/lib/schema'
import { MIC_CONTENT_KEYS, MIC_DEFAULTS, mergeMicContent, type MicContentKey } from '@/lib/mic'

function isAdmin(req: NextRequest) {
  return req.cookies.get('admin-auth')?.value === process.env.ADMIN_PASSWORD
}

/** GET /api/mic-content — admin only. Returns merged defaults + overrides. */
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const rows = await db.select().from(micContent)
  return NextResponse.json(mergeMicContent(rows))
}

/** POST /api/mic-content — admin only. Body: Record<MicContentKey, string>. */
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: Partial<Record<string, string>>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const upserts: Promise<unknown>[] = []
  for (const key of MIC_CONTENT_KEYS) {
    const value = body[key]
    if (typeof value !== 'string') continue
    // Skip if the value matches the baked default — keeps the DB small.
    if (value === MIC_DEFAULTS[key as MicContentKey]) continue
    upserts.push(
      db.insert(micContent)
        .values({ key, lang: 'de', value })
        .onConflictDoUpdate({
          target: [micContent.key, micContent.lang],
          set: { value, updatedAt: new Date() },
        })
    )
  }
  await Promise.all(upserts)
  return NextResponse.json({ ok: true })
}
