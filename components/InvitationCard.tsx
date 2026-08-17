import type { Lang, Translations } from '@/lib/i18n'

interface Props { lang: Lang; translations: Translations; invitedDays?: '22+23' | '23' }

export default function InvitationCard({ translations, invitedDays }: Props) {
  const body = invitedDays === '22+23'
    ? translations.inviteBody22and23
    : translations.inviteBody23only

  return (
    <div className="animate-card-rise bg-[#f5f0e8] text-[#1a0a0a] rounded-2xl p-8 max-w-lg mx-auto text-center shadow-2xl border border-[#c9a84c]/40">
      <p className="font-script text-5xl text-[#4a0a0a] mb-4">{translations.inviteHeading}</p>
      <div className="w-16 h-px bg-[#c9a84c] mx-auto mb-4" />
      <p className="font-serif text-base leading-relaxed text-[#1a0a0a]/80 mb-6">{body}</p>
      <p className="font-script text-2xl text-[#4a0a0a]">{translations.inviteClosing}</p>
    </div>
  )
}
