'use client'
import { useEffect, useState } from 'react'

/**
 * Permanent proscenium curtain — Wireframes.md §F.
 *
 * - Covers full viewport on load; opens over 3 s to fringe stop-points.
 * - Fringes stay for the lifetime of the page (component never unmounts).
 * - 10 slats per panel, alternating #4a0a0a / #3a0808, opacity 0.82.
 * - Gold inner edge 3 px, cream outer highlight 2 px, pleated hem radius 40 px.
 * - prefers-reduced-motion → jump straight to fringe position, no animation.
 *
 * Fringe widths (per side) & translate stop-points:
 *   ≤480 px mobile  : 6 vw  → panels stop at ±88% of own width
 *   481–1024 px iPad: 10 vw → panels stop at ±80%
 *   >1024 px desktop: 15 vw → panels stop at ±70%
 */

const SLAT_COUNT = 10
const SLAT_COLORS = ['#4a0a0a', '#3a0808']

export default function MicCurtainFrame() {
  const [opened, setOpened] = useState(false)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) { setOpened(true); return }
    const t = setTimeout(() => setOpened(true), 200)
    return () => clearTimeout(t)
  }, [])

  const slats = Array.from({ length: SLAT_COUNT })

  return (
    <>
      <style>{`
        /* ── Panel base ─────────────────────────────────────────────── */
        .mcp {
          position: fixed;
          inset-block: 0;
          width: 50vw;
          z-index: 9999;
          pointer-events: none;
          display: flex;
          transition: transform 3s linear;
          will-change: transform;
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

        /* ── Opened stop-points (mobile default 6 vw fringe → 88%) ── */
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
          .mcp { transition: none; }
        }

        /* ── Slat base ──────────────────────────────────────────────── */
        .mcp-s {
          flex: 1;
          position: relative;
          opacity: 0.82;
          /* Fold-line shadow via ::before */
        }

        /* Fold-line texture — every slat */
        .mcp-s::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(
            90deg,
            transparent 0%,
            transparent 85%,
            rgba(0,0,0,0.16) 85%,
            rgba(0,0,0,0.16) 100%
          );
          pointer-events: none;
          z-index: 1;
        }

        /* Pleated hem on outermost slat */
        .mcp-l .mcp-s:first-child { border-bottom-left-radius: 40px; }
        .mcp-r .mcp-s:first-child { border-bottom-right-radius: 40px; }

        /* Cream outer highlight on outermost slat */
        .mcp-l .mcp-s:first-child::after,
        .mcp-r .mcp-s:first-child::after {
          content: '';
          position: absolute;
          inset-block: 0;
          width: 2px;
          background: rgba(245,240,232,0.15);
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
            #c9a84c 25%,
            #c9a84c 75%,
            rgba(201,168,76,0) 100%
          );
          z-index: 2;
        }
        .mcp-l .mcp-s:last-child::after  { right: 0; }
        .mcp-r .mcp-s:last-child::after  { left: 0; }

        /* ── Monogram ───────────────────────────────────────────────── */
        .mcp-mono {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          font-family: var(--font-script, cursive);
          font-size: 2.25rem;
          color: rgba(201,168,76,0.6);
          user-select: none;
          pointer-events: none;
          z-index: 3;
          transition: opacity 0.6s ease 0.3s;
        }
        .mcp-l .mcp-mono { right: 12%; }
        .mcp-r .mcp-mono { left: 12%; }
        .opened .mcp-mono { opacity: 0; }

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
            #c9a84c 20%,
            #c9a84c 80%,
            rgba(201,168,76,0) 100%
          );
          transition: opacity 0.5s ease 0.25s;
        }
        .mcp-seam.opened { opacity: 0; }
      `}</style>

      {/* Centre seam */}
      <div className={`mcp-seam${opened ? ' opened' : ''}`} aria-hidden="true" />

      {/* Left panel */}
      <div className={`mcp mcp-l${opened ? ' opened' : ''}`} aria-hidden="true">
        {slats.map((_, i) => (
          <div key={i} className="mcp-s" style={{ background: SLAT_COLORS[i % 2] }} />
        ))}
        <span className="mcp-mono">J</span>
      </div>

      {/* Right panel */}
      <div className={`mcp mcp-r${opened ? ' opened' : ''}`} aria-hidden="true">
        {slats.map((_, i) => (
          <div key={i} className="mcp-s" style={{ background: SLAT_COLORS[i % 2] }} />
        ))}
        <span className="mcp-mono">S</span>
      </div>
    </>
  )
}
