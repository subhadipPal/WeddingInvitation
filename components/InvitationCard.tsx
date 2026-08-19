import type { Lang, Translations } from '@/lib/i18n'

interface Props { lang: Lang; translations: Translations; invitedDays?: '22+23' | '23'; isMulti?: boolean }

function tv(lang: Lang, isMulti: boolean, singular: string, multi: string) {
  return lang === 'de' && isMulti ? multi : singular
}

export default function InvitationCard({ lang, translations, invitedDays, isMulti = false }: Props) {
  const body = invitedDays === '22+23'
    ? tv(lang, isMulti, translations.inviteBody22and23, translations.inviteBody22and23Multi)
    : tv(lang, isMulti, translations.inviteBody23only, translations.inviteBody23onlyMulti)

  return (
    <div className="animate-card-rise bg-[#f5f0e8] text-[#1a0a0a] rounded-2xl p-5 sm:p-8 max-w-lg mx-auto text-center shadow-2xl border border-[#c9a84c]/40">
      <p className="font-script text-3xl sm:text-5xl text-[#4a0a0a] mb-3 sm:mb-4">{translations.inviteHeading}</p>
      <div className="w-12 sm:w-16 h-px bg-[#c9a84c] mx-auto mb-3 sm:mb-4" />
      <p className="font-serif text-sm sm:text-base leading-relaxed text-[#1a0a0a]/80 mb-4 sm:mb-6">{body}</p>
      <p className="font-script text-xl sm:text-2xl text-[#4a0a0a]">{translations.inviteClosing}</p>
    </div>
  )
}
