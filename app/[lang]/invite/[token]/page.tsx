import { readdirSync } from 'fs'
import { join } from 'path'
import type { Lang } from '@/lib/i18n'
import ScrollInvitation from '@/components/ScrollInvitation'

interface Props { params: Promise<{ lang: string; token: string }> }

function getPhotoList(): string[] {
  try {
    const dir = join(process.cwd(), 'public', 'photos')
    return readdirSync(dir)
      .filter(f => /\.(jpe?g|png|webp)$/i.test(f))
      .map(f => `/photos/${f}`)
  } catch {
    return []
  }
}

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

  // Invalid / missing token — show friendly error page
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
      photos={getPhotoList()}
      guest={{
        name: guest.name,
        invitedDays: guest.invitedDays as '22+23' | '23',
        token,
      }}
      existingRsvp={rsvp}
    />
  )
}
