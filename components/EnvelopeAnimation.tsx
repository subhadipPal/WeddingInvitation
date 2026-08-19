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
          {/* Envelope */}
          <div className="relative w-72 h-48 sm:w-96 sm:h-64 drop-shadow-2xl">
            {/* Body */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#f5f0e8] to-[#ede8de] rounded-xl shadow-2xl border border-[#c9a84c]/25" />
            {/* Bottom V-flap */}
            <div
              className="absolute bottom-0 left-0 right-0 h-1/2"
              style={{ clipPath: 'polygon(0 100%, 50% 0%, 100% 100%)', background: 'linear-gradient(180deg,#e8e0d0 0%,#d8cfc0 100%)' }}
            />
            {/* Left side diagonal */}
            <div
              className="absolute top-0 left-0 bottom-0 w-1/2"
              style={{ clipPath: 'polygon(0 0,100% 50%,0 100%)', background: 'linear-gradient(135deg,#ede8de 0%,#e0d8c8 100%)', opacity: 0.6 }}
            />
            {/* Right side diagonal */}
            <div
              className="absolute top-0 right-0 bottom-0 w-1/2"
              style={{ clipPath: 'polygon(100% 0,0 50%,100% 100%)', background: 'linear-gradient(225deg,#ede8de 0%,#e0d8c8 100%)', opacity: 0.6 }}
            />
            {/* Top flap */}
            <div
              className={`absolute top-0 left-0 right-0 h-1/2 origin-top ${animating ? 'animate-envelope-flap' : ''}`}
              style={{ transformStyle: 'preserve-3d', zIndex: 10 }}
            >
              <div
                className="w-full h-full rounded-t-xl border-b border-[#c9a84c]/20"
                style={{ clipPath: 'polygon(0 0,100% 0,50% 100%)', background: 'linear-gradient(180deg,#ede8de 0%,#d8cfc0 100%)' }}
              />
            </div>
            {/* Wax seal */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-xl"
                style={{ background: 'radial-gradient(circle at 35% 35%,#7a1020,#3a0808)', border: '2.5px solid #c9a84c99' }}>
                <span className="font-script text-[#c9a84c] text-xl sm:text-2xl leading-none">J♥R</span>
              </div>
            </div>
            {/* Inner envelope line */}
            <div className="absolute inset-[6px] rounded-[10px] border border-[#c9a84c]/15 pointer-events-none" />
          </div>
          <p className="font-script text-2xl text-[#c9a84c] text-center mt-4 animate-gold-shimmer">
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
