import { db } from '@/lib/db'
import { guests, micContent, micImages, micRsvps } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import {
  BAKED_HERO_PATH,
  MIC_IMAGE_SLOTS,
  mergeMicContent,
  type MicImageSlot,
  type MicImageVariant,
} from '@/lib/mic'
import MicInvitation from '@/components/MicInvitation'
import type { Metadata } from 'next'

interface Props { params: Promise<{ token: string }> }

export const metadata: Metadata = {
  title: 'Hochzeit · Julia & Subhadip',
  description: 'Hochzeitseinladung — Julia & Subhadip, Berlin, Januar 2027',
  robots: 'noindex, nofollow',
}

async function getGuest(micToken: string) {
  const rows = await db
    .select({
      id: guests.id,
      token: guests.token,            // STD token — used for the hamburger "open STD" link
      name: guests.name,
      invitedDays: guests.invitedDays,
      isMulti: guests.isMulti,
    })
    .from(guests)
    .where(eq(guests.micToken, micToken))
    .limit(1)
  return rows[0] ?? null
}

async function getMicPayload(guestId: string) {
  const [contentRows, imageRows, rsvpRows] = await Promise.all([
    db.select().from(micContent),
    db.select().from(micImages),
    db.select().from(micRsvps).where(eq(micRsvps.guestId, guestId)).limit(1),
  ])

  const content = mergeMicContent(contentRows)

  const images: Partial<Record<MicImageSlot, Partial<Record<MicImageVariant, string>>>> = {}
  for (const slot of MIC_IMAGE_SLOTS) images[slot] = {}
  for (const row of imageRows) {
    if ((MIC_IMAGE_SLOTS as readonly string[]).includes(row.slot)) {
      // Rewrite private blob URL → our public proxy; append uploadedAt as cache-buster
      // so browsers reload when admin replaces an image (same slot = same URL otherwise).
      const v = row.uploadedAt ? new Date(row.uploadedAt).getTime() : 0
      const proxyUrl = `/api/mic-images/img?url=${encodeURIComponent(row.url)}&v=${v}`
      images[row.slot as MicImageSlot]![row.variant as MicImageVariant] = proxyUrl
    }
  }

  const existingRsvp = rsvpRows[0]
    ? {
        attending22: rsvpRows[0].attending22,
        attending23: rsvpRows[0].attending23,
        address: rsvpRows[0].address,
        note: rsvpRows[0].note,
      }
    : null

  return { content, images, existingRsvp }
}

export default async function MicPage({ params }: Props) {
  const { token } = await params
  const guest = await getGuest(token)

  // Invalid or missing token — show branded "ungültig" screen using DB content.
  if (!guest || guest.invitedDays === '28') {
    const rows = await db.select().from(micContent)
    const content = mergeMicContent(rows)
    return (
      <main
        className="relative min-h-[100dvh] flex flex-col items-center justify-center px-8 text-center"
        style={{
          background:
            'radial-gradient(ellipse at 20% 20%, #5a1010 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, #2a0505 0%, transparent 60%), #3a0808',
        }}
      >
        <p className="font-script text-5xl text-[#c9a84c] mb-4">Julia & Subhadip</p>
        <div className="w-16 h-px bg-[#c9a84c]/40 mb-6" />
        <p className="font-serif text-[#f5f0e8]/70 text-base max-w-xs leading-relaxed whitespace-pre-wrap">
          {content.micInvalidTokenBody}
        </p>
        <p className="font-script text-2xl text-[#c9a84c]/60 mt-6">♥</p>
      </main>
    )
  }

  const { content, images, existingRsvp } = await getMicPayload(guest.id)

  // Only '22+23' and '23' reach here. Narrow the type for MicInvitation.
  const invitedDays = guest.invitedDays as '22+23' | '23'

  return (
    <MicInvitation
      content={content}
      images={images}
      guest={{
        name: guest.name,
        invitedDays,
        isMulti: guest.isMulti,
        micToken: token,
        stdToken: guest.token,
      }}
      existingRsvp={existingRsvp}
      bakedHeroPath={BAKED_HERO_PATH}
    />
  )
}
