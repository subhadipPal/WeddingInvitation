import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Julia & Ravi — Save the Date · 22 & 23 January 2027'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a0a0a 0%, #2d1010 50%, #1a0a0a 100%)',
          fontFamily: 'serif',
          position: 'relative',
        }}
      >
        {/* Corner roses */}
        <div style={{ position: 'absolute', top: 32, left: 48, fontSize: 64, opacity: 0.6 }}>🌹</div>
        <div style={{ position: 'absolute', top: 32, right: 48, fontSize: 64, opacity: 0.6 }}>🌹</div>
        <div style={{ position: 'absolute', bottom: 32, left: 48, fontSize: 64, opacity: 0.6 }}>🌹</div>
        <div style={{ position: 'absolute', bottom: 32, right: 48, fontSize: 64, opacity: 0.6 }}>🌹</div>

        {/* Border frame */}
        <div style={{
          position: 'absolute',
          inset: 24,
          border: '1px solid rgba(201,168,76,0.35)',
          borderRadius: 24,
        }} />

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
          <div style={{ fontSize: 52, marginBottom: 8 }}>💐</div>
          <div style={{
            fontSize: 28,
            color: '#c9a84c',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}>
            Save the Date
          </div>
          <div style={{
            fontSize: 80,
            color: '#f5f0e8',
            fontStyle: 'italic',
            lineHeight: 1.1,
            marginBottom: 24,
          }}>
            Julia &amp; Ravi
          </div>
          <div style={{
            width: 120,
            height: 1,
            background: 'rgba(201,168,76,0.5)',
            marginBottom: 24,
          }} />
          <div style={{
            fontSize: 30,
            color: '#c9a84c',
            letterSpacing: '0.15em',
          }}>
            22 &amp; 23 January 2027
          </div>
          <div style={{
            fontSize: 22,
            color: 'rgba(245,240,232,0.5)',
            marginTop: 12,
            letterSpacing: '0.1em',
          }}>
            Berlin
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
