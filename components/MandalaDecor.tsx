export default function MandalaDecor() {
  const Corner = () => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M0,0 Q55,0 100,100" stroke="#c9a84c" strokeWidth="0.8" opacity="0.35" fill="none"/>
      <path d="M0,0 Q35,15 70,100" stroke="#c9a84c" strokeWidth="0.5" opacity="0.22" fill="none"/>
      <path d="M0,0 Q15,35 100,70" stroke="#c9a84c" strokeWidth="0.5" opacity="0.22" fill="none"/>
      {[0.2, 0.4, 0.6, 0.8].map((t, i) => (
        <circle key={i}
          cx={100 * t}
          cy={100 * (1 - Math.sqrt(1 - t * t)) * 0.75}
          r="1.8" fill="#c9a84c" opacity="0.5"
        />
      ))}
    </svg>
  )

  return (
    <>
      <div className="pointer-events-none absolute top-0 left-0 w-28 h-28 sm:w-36 sm:h-36 opacity-70">
        <Corner />
      </div>
      <div className="pointer-events-none absolute top-0 right-0 w-28 h-28 sm:w-36 sm:h-36 opacity-70" style={{ transform: 'scaleX(-1)' }}>
        <Corner />
      </div>
      <div className="pointer-events-none absolute bottom-0 left-0 w-28 h-28 sm:w-36 sm:h-36 opacity-70" style={{ transform: 'scaleY(-1)' }}>
        <Corner />
      </div>
      <div className="pointer-events-none absolute bottom-0 right-0 w-28 h-28 sm:w-36 sm:h-36 opacity-70" style={{ transform: 'scale(-1)' }}>
        <Corner />
      </div>
    </>
  )
}
