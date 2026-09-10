'use client'
import { useRouter } from 'next/navigation'
import type { Lang } from '@/lib/i18n'

interface Props {
  lang: Lang
  token?: string
  langs?: Lang[]
}

const LABELS: Record<Lang, string> = { de: 'DE', en: 'EN', bn: 'বাং' }

export default function LanguageToggle({ lang, token, langs = ['de', 'en'] }: Props) {
  const router = useRouter()

  const switchTo = (next: Lang) => {
    if (token) {
      router.push(`/${next}/invite/${token}`)
    } else {
      router.push(next === 'de' ? '/' : `/${next}`)
    }
  }

  return (
    <div className="flex gap-1 text-sm font-serif">
      {langs.map(l => (
        <button
          key={l}
          onClick={() => switchTo(l)}
          className={`px-2 py-1 rounded border border-[#c9a84c] transition-colors ${
            lang === l ? 'bg-[#c9a84c] text-[#1a0a0a]' : 'text-[#c9a84c] hover:bg-[#c9a84c]/20'
          }`}
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  )
}
