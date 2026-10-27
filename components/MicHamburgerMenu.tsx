'use client'
import { useState } from 'react'

interface Props {
  /** Current MIC guest token — used to resolve the matching STD link. */
  stdHref: string
  /** DE label for the "open STD" item, from mic_content. */
  openStdLabel: string
}

/** Top-right hamburger menu on MIC. Fades in from invisible via its parent;
 *  it owns only the open/close state. Opens one item in a new tab (STD link). */
export default function MicHamburgerMenu({ stdHref, openStdLabel }: Props) {
  const [open, setOpen] = useState(false)
  return (
    <div className="fixed top-4 right-4 z-40">
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Menü schließen' : 'Menü öffnen'}
        aria-expanded={open}
        className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-[#c9a84c]/40 flex items-center justify-center text-[#c9a84c] hover:bg-black/60 transition-colors"
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop to close on outside tap */}
          <div
            className="fixed inset-0 z-[-1]"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute top-full right-0 mt-2 min-w-[220px] rounded-xl bg-[#1a0a0a]/95 backdrop-blur-md border border-[#c9a84c]/40 shadow-xl overflow-hidden">
            <a
              href={stdHref}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-5 py-3 font-serif text-sm text-[#f5f0e8] hover:bg-[#c9a84c]/15 transition-colors whitespace-nowrap"
              onClick={() => setOpen(false)}
            >
              {openStdLabel} →
            </a>
          </div>
        </>
      )}
    </div>
  )
}
