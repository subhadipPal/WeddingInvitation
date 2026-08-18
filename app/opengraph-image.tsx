import { ImageResponse } from 'next/og'
import { readFile } from 'fs/promises'
import { join } from 'path'

export const alt = 'Julia & Subhadip — Save the Date · 22 & 23 January 2027'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OgImage() {
  const [bgData, bouquetData, rosesData] = await Promise.all([
    readFile(join(process.cwd(), 'public/photos/og.png')),
    readFile(join(process.cwd(), 'public/photos/bouquet-icon.png')),
    readFile(join(process.cwd(), 'public/photos/flowers-heart-roses-icon.png')),
  ])

  const bgSrc = `data:image/png;base64,${bgData.toString('base64')}`
  const bouquetSrc = `data:image/png;base64,${bouquetData.toString('base64')}`
  const rosesSrc = `data:image/png;base64,${rosesData.toString('base64')}`

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
        <img src={bgSrc} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />

        {/* Dark overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(10,4,4,0.72) 0%, rgba(26,10,10,0.60) 50%, rgba(10,4,4,0.75) 100%)' }} />

        {/* Gold border frame */}
        <div style={{ position: 'absolute', inset: 28, border: '1.5px solid rgba(201,168,76,0.55)', borderRadius: 20 }} />
        <div style={{ position: 'absolute', inset: 36, border: '1px solid rgba(201,168,76,0.25)', borderRadius: 14 }} />

        {/* Corner bouquet icons */}
        <img src={bouquetSrc} style={{ position: 'absolute', top: 36, left: 44, width: 72, height: 72, objectFit: 'contain' }} />
        <img src={bouquetSrc} style={{ position: 'absolute', top: 36, right: 44, width: 72, height: 72, objectFit: 'contain' }} />
        <img src={bouquetSrc} style={{ position: 'absolute', bottom: 36, left: 44, width: 72, height: 72, objectFit: 'contain' }} />
        <img src={bouquetSrc} style={{ position: 'absolute', bottom: 36, right: 44, width: 72, height: 72, objectFit: 'contain' }} />

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, zIndex: 10, padding: '0 80px' }}>

          {/* Subtitle */}
          <div style={{ fontSize: 36, color: '#c9a84c', letterSpacing: '0.35em', textTransform: 'uppercase', fontFamily: 'serif', marginBottom: 18, textShadow: '0 1px 8px rgba(0,0,0,0.8)' }}>
            Save the Date
          </div>

          {/* Divider top */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ width: 120, height: 1, background: 'rgba(201,168,76,0.6)' }} />
            <img src={rosesSrc} style={{ width: 36, height: 36, objectFit: 'contain' }} />
            <div style={{ width: 120, height: 1, background: 'rgba(201,168,76,0.6)' }} />
          </div>

          {/* Names */}
          <div style={{ fontSize: 100, color: '#f5e8c0', fontStyle: 'italic', fontFamily: 'serif', lineHeight: 1.05, marginBottom: 20, textAlign: 'center', textShadow: '0 2px 24px rgba(0,0,0,0.9), 0 1px 4px rgba(0,0,0,0.7)', letterSpacing: '-0.01em' }}>
            Julia &amp; Subhadip
          </div>

          {/* Divider bottom */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ width: 120, height: 1, background: 'rgba(201,168,76,0.6)' }} />
            <img src={rosesSrc} style={{ width: 36, height: 36, objectFit: 'contain' }} />
            <div style={{ width: 120, height: 1, background: 'rgba(201,168,76,0.6)' }} />
          </div>

          {/* Date */}
          <div style={{ fontSize: 44, color: '#c9a84c', letterSpacing: '0.18em', fontFamily: 'serif', textShadow: '0 1px 8px rgba(0,0,0,0.8)', marginBottom: 10 }}>
            22 &amp; 23 January 2027
          </div>

          {/* Location */}
          <div style={{ fontSize: 32, color: 'rgba(245,232,192,0.65)', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'serif', textShadow: '0 1px 6px rgba(0,0,0,0.8)' }}>
            Berlin
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
