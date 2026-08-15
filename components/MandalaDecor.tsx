export default function MandalaDecor() {
  const RoseCorner = () => (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Curved vine lines */}
      <path d="M0,0 Q60,0 120,120" stroke="#c9a84c" strokeWidth="0.8" opacity="0.4" fill="none"/>
      <path d="M0,0 Q40,20 80,120" stroke="#c9a84c" strokeWidth="0.5" opacity="0.3" fill="none"/>
      <path d="M0,0 Q20,40 120,80" stroke="#c9a84c" strokeWidth="0.5" opacity="0.3" fill="none"/>
      {/* Gold dots along arc */}
      {[0.2,0.4,0.6,0.8].map((t, i) => (
        <circle key={i}
          cx={120 * t}
          cy={120 * (1 - Math.sqrt(1 - t * t)) * 0.8}
          r="2" fill="#c9a84c" opacity="0.6"
        />
      ))}
      {/* Rose */}
      <g transform="translate(72,72) scale(0.9)">
        <circle cx="0" cy="0" r="14" fill="#7a1020" opacity="0.9"/>
        <circle cx="0" cy="-8" r="7" fill="#9a1828" opacity="0.85"/>
        <circle cx="7" cy="4" r="7" fill="#9a1828" opacity="0.85"/>
        <circle cx="-7" cy="4" r="7" fill="#8a1424" opacity="0.85"/>
        <circle cx="0" cy="0" r="5" fill="#c0202e" opacity="0.9"/>
        {/* Leaves */}
        <ellipse cx="-16" cy="8" rx="6" ry="3" fill="#2d5a1b" opacity="0.8" transform="rotate(-30,-16,8)"/>
        <ellipse cx="16" cy="8" rx="6" ry="3" fill="#2d5a1b" opacity="0.8" transform="rotate(30,16,8)"/>
      </g>
      {/* Small accent roses */}
      <g transform="translate(28,85) scale(0.55)">
        <circle cx="0" cy="0" r="12" fill="#7a1020" opacity="0.8"/>
        <circle cx="0" cy="-7" r="6" fill="#9a1828" opacity="0.8"/>
        <circle cx="6" cy="4" r="6" fill="#9a1828" opacity="0.8"/>
        <circle cx="-6" cy="4" r="6" fill="#8a1424" opacity="0.8"/>
        <circle cx="0" cy="0" r="4" fill="#c0202e" opacity="0.9"/>
      </g>
      <g transform="translate(88,28) scale(0.45)">
        <circle cx="0" cy="0" r="12" fill="#7a1020" opacity="0.7"/>
        <circle cx="0" cy="-7" r="6" fill="#9a1828" opacity="0.7"/>
        <circle cx="6" cy="4" r="6" fill="#9a1828" opacity="0.7"/>
        <circle cx="-6" cy="4" r="6" fill="#8a1424" opacity="0.7"/>
        <circle cx="0" cy="0" r="4" fill="#c0202e" opacity="0.8"/>
      </g>
    </svg>
  )

  return (
    <>
      {/* Top-left */}
      <div className="pointer-events-none absolute top-0 left-0 w-32 h-32 sm:w-40 sm:h-40 opacity-80">
        <RoseCorner />
      </div>
      {/* Top-right (mirror X) */}
      <div className="pointer-events-none absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 opacity-80" style={{ transform: 'scaleX(-1)' }}>
        <RoseCorner />
      </div>
      {/* Bottom-left (mirror Y) */}
      <div className="pointer-events-none absolute bottom-0 left-0 w-32 h-32 sm:w-40 sm:h-40 opacity-80" style={{ transform: 'scaleY(-1)' }}>
        <RoseCorner />
      </div>
      {/* Bottom-right (mirror both) */}
      <div className="pointer-events-none absolute bottom-0 right-0 w-32 h-32 sm:w-40 sm:h-40 opacity-80" style={{ transform: 'scale(-1)' }}>
        <RoseCorner />
      </div>
    </>
  )
}
