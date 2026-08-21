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
          <div className="relative w-80 h-48 sm:w-[28rem] sm:h-64 drop-shadow-2xl">
            {/* Body */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#f5f0e8] to-[#ede8de] rounded-2xl shadow-2xl border border-[#c9a84c]/25" />
            {/* Folds clipped inside rounded corners */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
              {/* Bottom V-flap */}
              <div className="absolute bottom-0 left-0 right-0 h-1/2"
                style={{ clipPath: 'polygon(0 100%, 50% 0%, 100% 100%)', background: 'linear-gradient(180deg,#e8e0d0 0%,#d8cfc0 100%)' }} />
              {/* Left side diagonal */}
              <div className="absolute top-0 left-0 bottom-0 w-1/2"
                style={{ clipPath: 'polygon(0 0,100% 50%,0 100%)', background: 'linear-gradient(135deg,#ede8de 0%,#e0d8c8 100%)', opacity: 0.6 }} />
              {/* Right side diagonal */}
              <div className="absolute top-0 right-0 bottom-0 w-1/2"
                style={{ clipPath: 'polygon(100% 0,0 50%,100% 100%)', background: 'linear-gradient(225deg,#ede8de 0%,#e0d8c8 100%)', opacity: 0.6 }} />
            </div>
            {/* Top flap */}
            <div
              className={`absolute top-0 left-0 right-0 h-1/2 origin-top ${animating ? 'animate-envelope-flap' : ''}`}
              style={{ transformStyle: 'preserve-3d', zIndex: 10 }}
            >
              <div className="absolute inset-0 rounded-t-2xl overflow-hidden">
                <div className="w-full h-full border-b border-[#c9a84c]/20"
                  style={{ clipPath: 'polygon(0 0,100% 0,50% 100%)', background: 'linear-gradient(180deg,#ede8de 0%,#d8cfc0 100%)' }} />
              </div>
            </div>
            {/* Wax seal */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center"
                style={{
                  background: 'radial-gradient(circle at 35% 30%, #a01830, #7a1020 45%, #3a0808 100%)',
                  border: '2.5px solid #c9a84c99',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.6), 0 2px 6px rgba(0,0,0,0.4), inset 0 -6px 12px rgba(0,0,0,0.5), inset 0 4px 8px rgba(255,120,80,0.2), inset 0 1px 2px rgba(255,200,150,0.15)',
                }}>
                <span className="font-script text-[#c9a84c] text-xl sm:text-2xl leading-none"
                  style={{ letterSpacing: '0.15em', WebkitTextStroke: '0.5px #c9a84c', textShadow: '0 0 8px #c9a84c80' }}>J <span style={{ fontSize: '1.4em', verticalAlign: 'middle' }}>♥</span>S</span>
              </div>
            </div>
            {/* Inner envelope line */}
            <div className="absolute inset-[6px] rounded-[14px] border border-[#c9a84c]/15 pointer-events-none" />
          </div>
          <p className="font-script text-2xl text-[#c9a84c] text-center mt-4 animate-gold-shimmer">
            {translations.tapToOpen}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 sm:gap-5">
          <InvitationCard lang={lang} translations={translations} invitedDays={invitedDays} isMulti={isMulti} />
          {onScrollToRsvp && (
            <button
              onClick={onScrollToRsvp}
              className="group relative px-5 py-1.5 sm:px-8 sm:py-3 rounded-full font-serif text-[#1a0a0a] text-xs sm:text-sm tracking-wide overflow-hidden"
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
