import { db } from '@/lib/db'
import { guests } from '@/lib/schema'
import { micContent } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { mergeMicContent } from '@/lib/mic'
import type { Metadata } from 'next'

// PR A — minimal MIC page.
// Proves end-to-end plumbing: mic_token lookup → guest row → DB content → render.
// Full MIC experience (6 sections, curtain, petals, RSVP form) lands in PR B.

interface Props { params: Promise<{ token: string }> }

export const metadata: Metadata = {
  title: 'Hochzeit · Julia & Subhadip',
  description: 'Hochzeitseinladung — Julia & Subhadip, Berlin, Januar 2027',
  robots: 'noindex, nofollow', // Private per-guest link.
}

async function getGuestByMicToken(token: string) {
  const rows = await db
    .select({
      id: guests.id,
      name: guests.name,
      invitedDays: guests.invitedDays,
      isMulti: guests.isMulti,
    })
    .from(guests)
    .where(eq(guests.micToken, token))
    .limit(1)
  return rows[0] ?? null
}

async function getMicContent() {
  const rows = await db.select().from(micContent)
  return mergeMicContent(rows)
}

export default async function MicPage({ params }: Props) {
  const { token } = await params
  const guest = await getGuestByMicToken(token)
  const content = await getMicContent()

  if (!guest) {
    return (
      <main
        className="relative min-h-screen flex flex-col items-center justify-center px-8 text-center"
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

  // Day-28 Kolkata guests should never have a mic_token, but guard defensively.
  if (guest.invitedDays === '28') {
    return (
      <main
        className="relative min-h-screen flex flex-col items-center justify-center px-8 text-center"
        style={{ background: '#3a0808' }}
      >
        <p className="font-script text-5xl text-[#c9a84c] mb-4">Julia & Subhadip</p>
        <p className="font-serif text-[#f5f0e8]/70 text-base max-w-xs leading-relaxed">
          {content.micInvalidTokenBody}
        </p>
      </main>
    )
  }

  return (
    <main
      className="relative min-h-screen flex flex-col items-center justify-center px-8 text-center"
      style={{
        background:
          'radial-gradient(ellipse at 20% 20%, #5a1010 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, #2a0505 0%, transparent 60%), #3a0808',
      }}
    >
      <p className="font-serif text-[#c9a84c]/70 text-[10px] tracking-[0.5em] uppercase mb-2">
        Hochzeitseinladung
      </p>
      <p className="font-script text-5xl sm:text-6xl text-[#c9a84c] mb-2">
        Julia & Subhadip
      </p>
      <p className="font-serif text-[#c9a84c] text-sm tracking-widest uppercase mb-8">
        {content.micHeroDate}
      </p>
      <div className="w-16 h-px bg-[#c9a84c]/40 mb-6" />
      <p className="font-script text-3xl text-[#f5f0e8]">
        Hallo {guest.name}!
      </p>
      <p className="font-serif text-[#f5f0e8]/50 text-xs mt-8 max-w-md leading-relaxed">
        (PR A plumbing — die vollständige Einladung mit allen Seiten, Vorhang-Animation und
        RSVP-Formular folgt in PR B.)
      </p>
      <p className="font-serif text-[#f5f0e8]/30 text-[10px] mt-4">
        Invited: {guest.invitedDays} · isMulti: {String(guest.isMulti)}
      </p>
    </main>
  )
}
