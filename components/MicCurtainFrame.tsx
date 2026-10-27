'use client'
import { useState, useCallback } from 'react'

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

      <style>{`
        /* ── Panels ─────────────────────────────────────────────────── */
        .mcp {
          position: fixed;
          inset-block: 0;
          width: 50vw;
          z-index: 9999;
          pointer-events: none;
          display: flex;
          /* 3-D perspective context for slat rotateY */
          perspective: 800px;
          perspective-origin: center center;
          transition: transform ${OPEN_DURATION}s cubic-bezier(0.4,0,0.2,1);
          will-change: transform;
          opacity: 0.85;
        }
        .mcp-l {
          left: 0;
          flex-direction: row;
          transform: translateX(0);
        }
        .mcp-r {
          right: 0;
          flex-direction: row-reverse;
          transform: translateX(0);
        }

        /* Fringe stop-points (mobile 6 vw → 88%) */
        .mcp-l.opened { transform: translateX(-88%); }
        .mcp-r.opened { transform: translateX(88%); }
        @media (min-width: 481px) {
          .mcp-l.opened { transform: translateX(-80%); }
          .mcp-r.opened { transform: translateX(80%); }
        }
        @media (min-width: 1025px) {
          .mcp-l.opened { transform: translateX(-70%); }
          .mcp-r.opened { transform: translateX(70%); }
        }

        @media (prefers-reduced-motion: reduce) {
          .mcp { transition: none !important; }
          .mcp-s { transition: none !important; }
          .mic-ribbon { display: none; }
        }

        /* ── Slats ──────────────────────────────────────────────────── */
        .mcp-s {
          flex: 1;
          position: relative;
          transform-style: preserve-3d;
          /* Closed: inner slat faces viewer straight-on (rotateY 0),
             outer slat is partially folded toward the wall (rotateY −30deg left / +30deg right).
             On open: all slats flatten to 0 deg. */
          transition: transform ${SLAT_FOLD_DURATION}s cubic-bezier(0.4,0,0.2,1);
          transform-origin: left center;
        }
        /* Right panel slats fold from the other direction */
        .mcp-r .mcp-s { transform-origin: right center; }

        /* Fabric gradient simulates fold-lighting: bright centre → shadow at edge */
        .mcp-s::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(
              90deg,
              rgba(245,240,232,0.06) 0%,
              rgba(0,0,0,0)          30%,
              rgba(0,0,0,0.22)       80%,
              rgba(0,0,0,0.35)       100%
            ),
            repeating-linear-gradient(
              90deg,
              transparent 0%,
              transparent 88%,
              rgba(0,0,0,0.14) 88%,
              rgba(0,0,0,0.14) 100%
            );
          pointer-events: none;
          z-index: 1;
        }
        .mcp-r .mcp-s::before {
          background-image:
            linear-gradient(
              90deg,
              rgba(0,0,0,0.35)       0%,
              rgba(0,0,0,0.22)       20%,
              rgba(0,0,0,0)          70%,
              rgba(245,240,232,0.06) 100%
            ),
            repeating-linear-gradient(
              90deg,
              transparent 0%,
              transparent 88%,
              rgba(0,0,0,0.14) 88%,
              rgba(0,0,0,0.14) 100%
            );
        }

        /* Pleated hem */
        .mcp-l .mcp-s:first-child { border-bottom-left-radius: 40px; }
        .mcp-r .mcp-s:first-child { border-bottom-right-radius: 40px; }

        /* Cream outer highlight */
        .mcp-l .mcp-s:first-child::after,
        .mcp-r .mcp-s:first-child::after {
          content: '';
          position: absolute;
          inset-block: 0;
          width: 2px;
          background: rgba(245,240,232,0.18);
          z-index: 2;
        }
        .mcp-l .mcp-s:first-child::after { left: 0; }
        .mcp-r .mcp-s:first-child::after { right: 0; }

        /* Gold inner edge on innermost slat */
        .mcp-l .mcp-s:last-child::after,
        .mcp-r .mcp-s:last-child::after {
          content: '';
          position: absolute;
          inset-block: 0;
          width: 3px;
          background: linear-gradient(
            to bottom,
            rgba(201,168,76,0) 0%,
            #c9a84c 22%,
            #c9a84c 78%,
            rgba(201,168,76,0) 100%
          );
          z-index: 2;
        }
        .mcp-l .mcp-s:last-child::after  { right: 0; }
        .mcp-r .mcp-s:last-child::after  { left: 0; }

        /* ── Centre seam ────────────────────────────────────────────── */
        .mcp-seam {
          position: fixed;
          inset-block: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 1px;
          z-index: 10000;
          pointer-events: none;
          background: linear-gradient(
            to bottom,
            rgba(201,168,76,0) 0%,
            #c9a84c 18%,
            #c9a84c 82%,
            rgba(201,168,76,0) 100%
          );
          transition: opacity 0.6s ease 0.3s;
        }
        .mcp-seam.opened { opacity: 0; }

        /* ── Ribbon / tassel trigger ────────────────────────────────── */
        .mic-ribbon {
          position: fixed;
          left: 50%;
          top: 42%;
          transform: translate(-50%, -50%);
          z-index: 10001;
          cursor: pointer;
          pointer-events: auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          transition: opacity 0.4s ease;
          /* subtle breathing pulse */
          animation: ribbon-pulse 2.2s ease-in-out infinite;
          -webkit-tap-highlight-color: transparent;
          user-select: none;
        }
        .mic-ribbon.opened {
          opacity: 0;
          pointer-events: none;
          animation: none;
        }
        @keyframes ribbon-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50%       { transform: translate(-50%, -50%) scale(1.06); }
        }

        /* Ribbon knot circle */
        .mic-ribbon-knot {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: radial-gradient(circle at 38% 38%,
            #e8d48a 0%, #c9a84c 45%, #8a6a1a 100%);
          box-shadow:
            0 0 0 2px rgba(201,168,76,0.5),
            0 0 16px rgba(201,168,76,0.6),
            inset 0 2px 4px rgba(255,255,255,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          color: rgba(255,255,255,0.85);
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        }

        /* Ribbon cord going up */
        .mic-ribbon-cord {
          width: 2px;
          height: 60px;
          background: linear-gradient(to bottom,
            rgba(201,168,76,0.2),
            rgba(201,168,76,0.8) 50%,
            rgba(201,168,76,0.2));
          margin-bottom: -2px;
          order: -1;
        }

        /* Tassel strands below knot */
        .mic-ribbon-tassel {
          display: flex;
          gap: 3px;
          margin-top: 2px;
        }
        .mic-ribbon-strand {
          width: 2px;
          border-radius: 1px;
          background: linear-gradient(to bottom, #c9a84c, rgba(201,168,76,0.15));
          animation: strand-sway 1.8s ease-in-out infinite;
        }
        .mic-ribbon-strand:nth-child(2) { animation-delay: 0.2s; }
        .mic-ribbon-strand:nth-child(3) { animation-delay: 0.4s; }
        .mic-ribbon-strand:nth-child(4) { animation-delay: 0.1s; }
        .mic-ribbon-strand:nth-child(5) { animation-delay: 0.3s; }
        @keyframes strand-sway {
          0%, 100% { transform: rotate(-3deg); }
          50%       { transform: rotate(3deg); }
        }

        /* Hint label under tassel */
        .mic-ribbon-label {
          font-family: var(--font-serif, serif);
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(201,168,76,0.8);
          margin-top: 10px;
          text-shadow: 0 1px 4px rgba(0,0,0,0.8);
          white-space: nowrap;
        }
      `}</style>

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
          // Slat fold: outer slat (i=0) folds most, inner (i=9) is flat
          // Left panel: slats fold away to the left (negative rotateY)
          const closedAngle = -(i === 0 ? 28 : i < 3 ? 18 : i < 6 ? 10 : 4)
          // Stagger: inner slats (high i) start unfolding first
          const delay = ((SLAT_COUNT - 1 - i) / SLAT_COUNT) * 0.8
          return (
            <div
              key={i}
              className="mcp-s"
              style={{
                background: SLAT_COLORS[i % 2],
                transform: opened ? 'rotateY(0deg)' : `rotateY(${closedAngle}deg)`,
                transitionDelay: opened ? `${delay}s` : '0s',
              }}
            />
          )
        })}
      </div>

      {/* Right panel */}
      <div className={`mcp mcp-r${opened ? ' opened' : ''}`} aria-hidden="true">
        {slats.map((_, i) => {
          const closedAngle = (i === 0 ? 28 : i < 3 ? 18 : i < 6 ? 10 : 4)
          const delay = ((SLAT_COUNT - 1 - i) / SLAT_COUNT) * 0.8
          return (
            <div
              key={i}
              className="mcp-s"
              style={{
                background: SLAT_COLORS[i % 2],
                transform: opened ? 'rotateY(0deg)' : `rotateY(${closedAngle}deg)`,
                transitionDelay: opened ? `${delay}s` : '0s',
              }}
            />
          )
        })}
      </div>
    </>
  )
}
