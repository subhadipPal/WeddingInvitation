'use client'
import { useState } from 'react'
import { t, type Lang } from '@/lib/i18n'
import InvitationCard from './InvitationCard'

interface Props { lang: Lang; onOpen?: () => void }

export default function EnvelopeAnimation({ lang, onOpen }: Props) {
  const [opened, setOpened] = useState(false)
  const [animating, setAnimating] = useState(false)

  const handleOpen = () => {
    if (opened || animating) return
    setAnimating(true)
    onOpen?.()
    setTimeout(() => { setOpened(true); setAnimating(false) }, 1200)
  }

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
            {t('tapToOpen', lang)}
          </p>
        </div>
      ) : (
        <InvitationCard lang={lang} />
      )}
    </div>
  )
}
