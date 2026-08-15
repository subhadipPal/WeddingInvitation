export default function MandalaDecor() {
  const mandala = (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="0" cy="0" r="180" stroke="#c9a84c" strokeWidth="0.5" fill="none"/>
      <circle cx="0" cy="0" r="140" stroke="#c9a84c" strokeWidth="0.5" fill="none"/>
      <circle cx="0" cy="0" r="100" stroke="#c9a84c" strokeWidth="1" fill="none"/>
      {Array.from({ length: 12 }).map((_, i) => (
        <line
          key={`l${i}`}
          x1="0" y1="0"
          x2={180 * Math.cos((i * 30 * Math.PI) / 180)}
          y2={180 * Math.sin((i * 30 * Math.PI) / 180)}
          stroke="#c9a84c" strokeWidth="0.5" opacity="0.6"
        />
      ))}
      {Array.from({ length: 12 }).map((_, i) => (
        <circle
          key={`c${i}`}
          cx={120 * Math.cos((i * 30 * Math.PI) / 180)}
          cy={120 * Math.sin((i * 30 * Math.PI) / 180)}
          r="4" fill="#c9a84c" opacity="0.8"
        />
      ))}
    </svg>
  )

  return (
    <>
      <div className="pointer-events-none absolute top-0 left-0 w-48 h-48 opacity-40 animate-gold-shimmer">{mandala}</div>
      <div className="pointer-events-none absolute top-0 right-0 w-48 h-48 opacity-40 animate-gold-shimmer [transform:scaleX(-1)]">{mandala}</div>
      <div className="pointer-events-none absolute bottom-0 left-0 w-48 h-48 opacity-40 animate-gold-shimmer [transform:scaleY(-1)]">{mandala}</div>
      <div className="pointer-events-none absolute bottom-0 right-0 w-48 h-48 opacity-40 animate-gold-shimmer [transform:scale(-1)]">{mandala}</div>
    </>
  )
}
