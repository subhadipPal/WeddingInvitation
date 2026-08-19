import { readdirSync } from 'fs'
import { join } from 'path'
import type { Lang } from '@/lib/i18n'
import { loadTranslations } from '@/lib/i18n.server'
import ScrollInvitation from '@/components/ScrollInvitation'
import { db } from '@/lib/db'
import { guests, rsvps } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import type { Metadata } from 'next'

interface Props { params: Promise<{ lang: string; token: string }> }

const base = 'https://www.juliaundsubhadip.xyz'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Julia & Subhadip — Save the Date · 22 & 23 January 2027',
    description: 'Save the Date — Julia Schulze & Subhadip Pal, Berlin, January 2027',
    openGraph: {
      title: 'Julia & Subhadip — Save the Date · 22 & 23 January 2027',
      description: 'Save the Date — Julia Schulze & Subhadip Pal, Berlin, January 2027',
      images: [{ url: `${base}/opengraph-image`, width: 1200, height: 630 }],
    },
  }
}

function getPhotoList(): string[] {
  try {
    const dir = join(process.cwd(), 'public', 'photos')
    return readdirSync(dir)
      .filter(f => /\.(jpe?g|png|webp)$/i.test(f) && f !== 'background.jpeg')
      .sort()
      .map(f => `/photos/${f}`)
  } catch {
    return []
  }
}

async function getGuest(token: string) {
  const rows = await db.select().from(guests).where(eq(guests.token, token)).limit(1)
  if (!rows.length) return null
  const rsvp = await db.select().from(rsvps).where(eq(rsvps.guestId, rows[0].id)).limit(1)
  return { guest: rows[0], rsvp: rsvp[0] ?? null }
}

export default async function InvitePage({ params }: Props) {
  const { lang: langParam, token } = await params
  const lang = (langParam === 'en' ? 'en' : 'de') as Lang
  const [data, translations] = await Promise.all([getGuest(token), loadTranslations(lang)])

  if (!data) {
    return (
      <main className="relative min-h-screen flex flex-col items-center justify-center px-8 text-center"
        style={{ background: 'radial-gradient(ellipse at 20% 20%, #5a1010 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, #2a0505 0%, transparent 60%), #3a0808' }}>
        <p className="font-script text-5xl text-[#c9a84c] mb-4">Julia & Ravi</p>
        <div className="w-16 h-px bg-[#c9a84c]/40 mb-6" />
        <p className="font-serif text-[#f5f0e8]/70 text-base max-w-xs leading-relaxed">
          {lang === 'de'
            ? 'Dieser Einladungslink ist leider ungültig. Bitte wende dich an Julia oder Ravi.'
            : 'This invitation link is invalid. Please contact Julia or Ravi.'}
        </p>
        <p className="font-script text-2xl text-[#c9a84c]/60 mt-6">♥</p>
      </main>
    )
  }

  const { guest, rsvp } = data

  return (
    <ScrollInvitation
      lang={lang}
      translations={translations}
      photos={getPhotoList()}
      guest={{
        name: guest.name,
        invitedDays: guest.invitedDays as '22+23' | '23',
        token,
        isMulti: guest.isMulti,
      }}
      existingRsvp={rsvp}
    />
  )
}
