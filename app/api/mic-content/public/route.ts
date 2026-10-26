import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { micContent } from '@/lib/schema'
import { mergeMicContent } from '@/lib/mic'

// Prevent Next from trying to prerender this at build time (no DATABASE_URL in CI).
export const dynamic = 'force-dynamic'

/** GET /api/mic-content/public — unauthenticated. Used by the public MIC page
 *  for server-side rendering. Only returns MIC content; no sensitive data. */
export async function GET() {
  const rows = await db.select().from(micContent)
  return NextResponse.json(mergeMicContent(rows))
}
