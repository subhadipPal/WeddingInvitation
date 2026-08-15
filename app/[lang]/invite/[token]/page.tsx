import { notFound } from 'next/navigation'
import type { Lang } from '@/lib/i18n'
import { t } from '@/lib/i18n'
import MandalaDecor from '@/components/MandalaDecor'
import LanguageToggle from '@/components/LanguageToggle'
import MusicPlayer from '@/components/MusicPlayer'
import RsvpForm from '@/components/RsvpForm'
import CountdownTimer from '@/components/CountdownTimer'

interface Props { params: Promise<{ lang: string; token: string }> }

async function getGuest(token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/guests/${token}`, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

export default async function InvitePage({ params }: Props) {
  const { lang: langParam, token } = await params
  const lang = (langParam === 'en' ? 'en' : 'de') as Lang
  const data = await getGuest(token)
  if (!data) notFound()

  const { guest, rsvp } = data
  const invitedDays = guest.invitedDays as '22+23' | '23'

  return (
    <main className="relative min-h-screen bg-[#1a0a0a] overflow-hidden">
      <MandalaDecor />

      <div className="absolute top-4 right-4 z-20">
        <LanguageToggle lang={lang} token={token} />
      </div>

      <div className="relative z-10 flex flex-col items-center px-4 py-16 gap-8">
        <h1 className="font-script text-5xl sm:text-6xl text-[#c9a84c] text-center">
          {t('rsvpGreeting', lang)} {guest.name}!
        </h1>

        <div className="w-24 h-px bg-[#c9a84c]/50" />

        <p className="font-serif text-[#f5f0e8]/80 text-center text-lg max-w-md">
          {t(invitedDays === '22+23' ? 'rsvpInvited22and23' : 'rsvpInvited23only', lang)}
        </p>

        <CountdownTimer lang={lang} />

        <div className="w-full max-w-md mt-4">
          <RsvpForm
            token={token}
            guestName={guest.name}
            invitedDays={invitedDays}
            lang={lang}
            existingRsvp={rsvp}
          />
        </div>

        <div className="w-24 h-px bg-[#c9a84c]/50 mt-4" />
        <p className="font-script text-2xl text-[#f5f0e8]/50">Julia & Ravi · 2027</p>
      </div>

      <MusicPlayer />
    </main>
  )
}
