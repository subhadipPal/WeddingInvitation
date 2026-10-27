'use client'
import { useEffect, useState } from 'react'

/**
 * Theatrical curtain that covers the viewport on first load and slides open.
 * Two fabric panels sweep left and right over ~1.6 s, revealing the page.
 * Unmounts itself after the animation completes to leave zero DOM overhead.
 */
export default function MicCurtainFrame() {
  const [phase, setPhase] = useState<'closed' | 'opening' | 'done'>('closed')

  useEffect(() => {
    // Brief pause so the page paint is complete before the curtain starts moving
    const t1 = setTimeout(() => setPhase('opening'), 400)
    const t2 = setTimeout(() => setPhase('done'), 2200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  if (phase === 'done') return null

  const isOpening = phase === 'opening'

  const panelBase =
    'absolute inset-y-0 w-1/2 transition-transform duration-[1600ms] ease-in-out will-change-transform'
  const fabricStyle: React.CSSProperties = {
    background:
      'linear-gradient(180deg, #2a0404 0%, #4a0808 15%, #3a0606 40%, #5a0a0a 65%, #3a0606 85%, #2a0404 100%)',
    boxShadow: 'inset -8px 0 24px rgba(0,0,0,0.5), inset 8px 0 24px rgba(0,0,0,0.5)',
  }

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden pointer-events-none">
      {/* Left curtain panel */}
      <div
        className={`${panelBase} left-0`}
        style={{
          ...fabricStyle,
          transform: isOpening ? 'translateX(-102%)' : 'translateX(0)',
          boxShadow: 'inset -12px 0 30px rgba(0,0,0,0.6)',
        }}
      >
        {/* Vertical fold lines — give fabric texture */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 28px, rgba(0,0,0,0.4) 28px, rgba(0,0,0,0.4) 30px)',
        }} />
        {/* Gold trim on the inner edge */}
        <div className="absolute right-0 inset-y-0 w-[3px] bg-gradient-to-b from-[#c9a84c]/0 via-[#c9a84c]/60 to-[#c9a84c]/0" />
        {/* Monogram at curtain centre */}
        <div className={`absolute right-6 top-1/2 -translate-y-1/2 transition-opacity duration-300 ${isOpening ? 'opacity-0' : 'opacity-100'}`}>
          <p className="font-script text-3xl text-[#c9a84c]/70 select-none">J</p>
        </div>
      </div>

      {/* Right curtain panel */}
      <div
        className={`${panelBase} right-0`}
        style={{
          ...fabricStyle,
          transform: isOpening ? 'translateX(102%)' : 'translateX(0)',
          boxShadow: 'inset 12px 0 30px rgba(0,0,0,0.6)',
        }}
      >
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 28px, rgba(0,0,0,0.4) 28px, rgba(0,0,0,0.4) 30px)',
        }} />
        {/* Gold trim on the inner edge */}
        <div className="absolute left-0 inset-y-0 w-[3px] bg-gradient-to-b from-[#c9a84c]/0 via-[#c9a84c]/60 to-[#c9a84c]/0" />
        <div className={`absolute left-6 top-1/2 -translate-y-1/2 transition-opacity duration-300 ${isOpening ? 'opacity-0' : 'opacity-100'}`}>
          <p className="font-script text-3xl text-[#c9a84c]/70 select-none">S</p>
        </div>
      </div>

      {/* Centre seam — gold line that splits as panels open */}
      <div
        className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-[#c9a84c]/0 via-[#c9a84c]/80 to-[#c9a84c]/0 transition-opacity duration-500"
        style={{ opacity: isOpening ? 0 : 1 }}
      />
    </div>
  )
}
