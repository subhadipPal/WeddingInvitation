'use client'
import { useState } from 'react'
import type { Lang, Translations } from '@/lib/i18n'
import InvitationCard from './InvitationCard'

interface Props {
  lang: Lang
  translations: Translations
  invitedDays?: '22+23' | '23'
  isMulti?: boolean
  onOpen?: () => void
  onScrollToRsvp?: () => void
}

export default function EnvelopeAnimation({ lang, translations, invitedDays, isMulti, onOpen, onScrollToRsvp }: Props) {
  const [opened, setOpened] = useState(false)
  const [animating, setAnimating] = useState(false)

  const handleOpen = () => {
    if (opened || animating) return
    setAnimating(true)
    onOpen?.()
    setTimeout(() => { setOpened(true); setAnimating(false) }, 1200)
  }

  const rsvpLabel = lang === 'de' ? 'Wirst du dabei sein?' : 'Will you be able to attend?'

  return (
    <div className="flex flex-col items-center gap-4">
      {!opened ? (
        <div className="cursor-pointer select-none" onClick={handleOpen}>
          <div className="relative w-56 h-36 sm:w-72 sm:h-48">
            <div className="absolute inset-0 bg-[#f5f0e8] rounded-lg shadow-2xl border border-[#c9a84c]/30" />
            <div
              className={`absolute top-0 left-0 right-0 h-1/2 origin-top ${animating ? 'animate-envelope-flap' : ''}`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div
                className="w-full h-full bg-[#ede8de] rounded-t-lg border border-[#c9a84c]/20"
                style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}
              />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-11 h-11 rounded-full bg-[#4a0a0a] border-2 border-[#c9a84c]/60 flex items-center justify-center shadow-lg">
                <span className="font-script text-[#c9a84c] text-base">J♥R</span>
              </div>
            </div>
            <div className="absolute -bottom-1 -left-3 text-3xl opacity-80">🌹</div>
            <div className="absolute -bottom-1 -right-3 text-3xl opacity-80">🌸</div>
          </div>
          <p className="font-script text-xl text-[#c9a84c] text-center mt-3 animate-gold-shimmer">
            {translations.tapToOpen}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-5">
          <InvitationCard lang={lang} translations={translations} invitedDays={invitedDays} isMulti={isMulti} />
          {onScrollToRsvp && (
            <button
              onClick={onScrollToRsvp}
              className="group relative mt-2 px-8 py-3 rounded-full font-serif text-[#1a0a0a] text-sm tracking-wide overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #e0bd6e 0%, #c9a84c 50%, #b8943a 100%)',
                animation: 'rsvp-pulse 2.5s ease-in-out infinite',
                boxShadow: '0 4px 20px #c9a84c50',
              }}
            >
              <span className="relative z-10 font-semibold">{rsvpLabel}</span>
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(135deg, #f0d080 0%, #e0bd6e 50%, #c9a84c 100%)' }}
              />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
