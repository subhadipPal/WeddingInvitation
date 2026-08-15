'use client'
import { useRouter } from 'next/navigation'
import type { Lang } from '@/lib/i18n'

interface Props {
  lang: Lang
  token?: string
}

export default function LanguageToggle({ lang, token }: Props) {
  const router = useRouter()

  const switchTo = (next: Lang) => {
    if (token) {
      router.push(`/${next}/invite/${token}`)
    } else {
      router.push(next === 'de' ? '/' : '/en')
    }
  }

  return (
    <div className="flex gap-1 text-sm font-serif">
      <button
        onClick={() => switchTo('de')}
        className={`px-2 py-1 rounded border border-[#c9a84c] transition-colors ${
          lang === 'de' ? 'bg-[#c9a84c] text-[#1a0a0a]' : 'text-[#c9a84c] hover:bg-[#c9a84c]/20'
        }`}
      >
        DE
      </button>
      <button
        onClick={() => switchTo('en')}
        className={`px-2 py-1 rounded border border-[#c9a84c] transition-colors ${
          lang === 'en' ? 'bg-[#c9a84c] text-[#1a0a0a]' : 'text-[#c9a84c] hover:bg-[#c9a84c]/20'
        }`}
      >
        EN
      </button>
    </div>
  )
}
