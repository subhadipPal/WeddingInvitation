'use client'
import { useState, useCallback } from 'react'
import './MicCurtainFrame.module.css'

/**
 * 3-D proscenium curtain — click/tap the ribbon to open.
 *
 * Visual technique:
 *  - CSS perspective on each panel + rotateY per slat → realistic folded-fabric depth.
 *  - Slats accordion-unfold with staggered delays (inner first).
 *  - Fabric gradient per slat simulates lighting (highlight → shadow → highlight).
 *  - Panel-level translateX carries the whole accordion to the fringe stop-point.
 *  - Gold tassel ribbon hangs at the centre seam; tapping it triggers open + music.
 *
 * Fringe stop-points (per Wireframes.md §F.2):
 *   ≤480 px mobile  : 6 vw fringe  → panels travel −88% / +88%
 *   481–1024 px iPad: 10 vw fringe → −80% / +80%
 *   >1024 px desktop: 15 vw fringe → −70% / +70%
 *
 * prefers-reduced-motion → instant fringe position, no animation, no ribbon.
 */

const SLAT_COUNT = 10
const SLAT_COLORS = ['#4a0a0a', '#3a0808']
// Stagger: inner slat (index 9) starts first, outer (index 0) last
const OPEN_DURATION = 3.0   // panel translateX duration (s)
const SLAT_FOLD_DURATION = 1.4  // each slat's rotateY unwind (s)

export default function MicCurtainFrame() {
  const [opened, setOpened] = useState(false)

  const handleOpen = useCallback(() => {
    if (opened) return
    setOpened(true)

    // Signal petal overlay to start
    window.dispatchEvent(new CustomEvent('mic:curtain-opened'))

    // Play music — audio element inserted once; user gesture satisfies autoplay policy
    const audio = document.getElementById('mic-bg-audio') as HTMLAudioElement | null
    if (audio) {
      audio.volume = 0
      audio.play().then(() => {
        // Fade in volume over 4 s
        let v = 0
        const step = () => {
          v = Math.min(v + 0.02, 0.55)
          audio.volume = v
          if (v < 0.55) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
      }).catch(() => {/* autoplay blocked — silent fail */})
    }
  }, [opened])

  const slats = Array.from({ length: SLAT_COUNT })

  return (
    <>
      {/* Background music — hidden, loops */}
      <audio
        id="mic-bg-audio"
        src="/audio/canon_d_major_instrumental.mpeg"
        loop
        preload="auto"
        style={{ display: 'none' }}
      />

      <style>{`:root { --open-dur: ${OPEN_DURATION}s; --slat-fold-dur: ${SLAT_FOLD_DURATION}s; }`}</style>

      {/* Centre seam */}
      <div className={`mcp-seam${opened ? ' opened' : ''}`} aria-hidden="true" />

      {/* Ribbon trigger */}
      <div
        className={`mic-ribbon${opened ? ' opened' : ''}`}
        onClick={handleOpen}
        onKeyDown={e => e.key === 'Enter' && handleOpen()}
        role="button"
        tabIndex={0}
        aria-label="Einladung öffnen"
      >
        <div className="mic-ribbon-cord" />
        <div className="mic-ribbon-knot">♥</div>
        <div className="mic-ribbon-tassel">
          {[40, 55, 65, 55, 40].map((h, i) => (
            <div key={i} className="mic-ribbon-strand" style={{ height: h }} />
          ))}
        </div>
        <span className="mic-ribbon-label">zum Öffnen tippen</span>
      </div>

      {/* Left panel */}
      <div className={`mcp mcp-l${opened ? ' opened' : ''}`} aria-hidden="true">
        {slats.map((_, i) => {
          // Stagger: inner slats (high i) crush first, outer (i=0) last
          const delay = ((SLAT_COUNT - 1 - i) / SLAT_COUNT) * 0.8
          return (
            <div
              key={i}
              className="mcp-s"
              style={{
                background: SLAT_COLORS[i % 2],
                transform: opened ? 'scaleX(0)' : 'scaleX(1)',
                transitionDelay: opened ? `${delay}s` : '0s',
              }}
            />
          )
        })}
      </div>

      {/* Right panel */}
      <div className={`mcp mcp-r${opened ? ' opened' : ''}`} aria-hidden="true">
        {slats.map((_, i) => {
          const delay = ((SLAT_COUNT - 1 - i) / SLAT_COUNT) * 0.8
          return (
            <div
              key={i}
              className="mcp-s"
              style={{
                background: SLAT_COLORS[i % 2],
                transform: opened ? 'scaleX(0)' : 'scaleX(1)',
                transitionDelay: opened ? `${delay}s` : '0s',
              }}
            />
          )
        })}
      </div>
    </>
  )
}
