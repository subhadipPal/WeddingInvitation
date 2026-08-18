import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Julia & Subhadip — Save the Date · 22 & 23 January 2027'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

async function getOgContent() {
  try {
    const base = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'
    const res = await fetch(`${base}/api/og-content`, { next: { revalidate: 60 } })
    if (res.ok) return res.json()
  } catch {}
  return { ogTitle: 'Julia & Subhadip', ogSubtitle: 'Save the Date', ogDate: '22 & 23 January 2027', ogLocation: 'Berlin' }
}

export default async function OgImage() {
  const { ogTitle, ogSubtitle, ogDate, ogLocation } = await getOgContent()

  const bouquetUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}/photos/rose/bouquet.jpeg`
    : 'http://localhost:3000/photos/rose/bouquet.jpeg'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bouquetUrl}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />

        {/* Dark overlay for readability */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(10,4,4,0.72) 0%, rgba(26,10,10,0.60) 50%, rgba(10,4,4,0.75) 100%)',
          }}
        />

        {/* Gold border frame */}
        <div
          style={{
            position: 'absolute',
            inset: 28,
            border: '1.5px solid rgba(201,168,76,0.55)',
            borderRadius: 20,
          }}
        />
        {/* Inner hairline */}
        <div
          style={{
            position: 'absolute',
            inset: 36,
            border: '1px solid rgba(201,168,76,0.25)',
            borderRadius: 14,
          }}
        />

        {/* Corner roses */}
        <div style={{ position: 'absolute', top: 44, left: 56, fontSize: 56 }}>🌹</div>
        <div style={{ position: 'absolute', top: 44, right: 56, fontSize: 56 }}>🌹</div>
        <div style={{ position: 'absolute', bottom: 44, left: 56, fontSize: 56 }}>🌹</div>
        <div style={{ position: 'absolute', bottom: 44, right: 56, fontSize: 56 }}>🌹</div>

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0,
            zIndex: 10,
            padding: '0 80px',
          }}
        >
          {/* Subtitle */}
          <div
            style={{
              fontSize: 24,
              color: '#c9a84c',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              fontFamily: 'serif',
              marginBottom: 18,
              textShadow: '0 1px 8px rgba(0,0,0,0.8)',
            }}
          >
            {ogSubtitle}
          </div>

          {/* Divider top */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ width: 80, height: 1, background: 'rgba(201,168,76,0.6)' }} />
            <div style={{ fontSize: 22, color: '#c9a84c' }}>✦</div>
            <div style={{ width: 80, height: 1, background: 'rgba(201,168,76,0.6)' }} />
          </div>

          {/* Names */}
          <div
            style={{
              fontSize: 88,
              color: '#f5e8c0',
              fontStyle: 'italic',
              fontFamily: 'serif',
              lineHeight: 1.05,
              marginBottom: 20,
              textAlign: 'center',
              textShadow: '0 2px 24px rgba(0,0,0,0.9), 0 1px 4px rgba(0,0,0,0.7)',
              letterSpacing: '-0.01em',
            }}
          >
            {ogTitle}
          </div>

          {/* Divider bottom */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ width: 80, height: 1, background: 'rgba(201,168,76,0.6)' }} />
            <div style={{ fontSize: 22, color: '#c9a84c' }}>✦</div>
            <div style={{ width: 80, height: 1, background: 'rgba(201,168,76,0.6)' }} />
          </div>

          {/* Date */}
          <div
            style={{
              fontSize: 32,
              color: '#c9a84c',
              letterSpacing: '0.18em',
              fontFamily: 'serif',
              textShadow: '0 1px 8px rgba(0,0,0,0.8)',
              marginBottom: 10,
            }}
          >
            {ogDate}
          </div>

          {/* Location */}
          <div
            style={{
              fontSize: 22,
              color: 'rgba(245,232,192,0.65)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontFamily: 'serif',
              textShadow: '0 1px 6px rgba(0,0,0,0.8)',
            }}
          >
            {ogLocation}
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
