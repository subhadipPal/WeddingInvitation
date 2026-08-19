import { ImageResponse } from 'next/og'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { translations } from '@/lib/i18n'

export const alt = 'Julia & Subhadip — Save the Date · 22 & 23 January 2027'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const dynamic = 'force-dynamic'

export default async function OgImage() {
  const og = {
    ogTitle: translations.en.ogTitle,
    ogSubtitle: translations.en.ogSubtitle,
    ogDate: translations.en.ogDate,
    ogLocation: translations.en.ogLocation,
  }

  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/og-content`, { cache: 'no-store' })
    if (res.ok) Object.assign(og, await res.json())
  } catch {
    // fall through to defaults
  }

  const bgBuf = await readFile(join(process.cwd(), 'public/photos/og-small.jpg'))

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`data:image/jpeg;base64,${bgBuf.toString('base64')}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(10,4,4,0.72) 0%, rgba(26,10,10,0.60) 50%, rgba(10,4,4,0.75) 100%)' }} />
        <div style={{ position: 'absolute', inset: 28, border: '1.5px solid rgba(201,168,76,0.55)', borderRadius: 20 }} />
        <div style={{ position: 'absolute', inset: 36, border: '1px solid rgba(201,168,76,0.25)', borderRadius: 14 }} />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, zIndex: 10, padding: '0 80px' }}>
          <div style={{ fontSize: 36, color: '#c9a84c', letterSpacing: '0.35em', textTransform: 'uppercase', fontFamily: 'serif', marginBottom: 18, textShadow: '0 1px 8px rgba(0,0,0,0.8)' }}>
            {og.ogSubtitle}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ width: 120, height: 1, background: 'rgba(201,168,76,0.6)' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#c9a84c' }} />
            <div style={{ width: 120, height: 1, background: 'rgba(201,168,76,0.6)' }} />
          </div>
          <div style={{ fontSize: 100, color: '#f5e8c0', fontStyle: 'italic', fontFamily: 'serif', lineHeight: 1.05, marginBottom: 20, textAlign: 'center', textShadow: '0 2px 24px rgba(0,0,0,0.9)', letterSpacing: '-0.01em' }}>
            {og.ogTitle}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ width: 120, height: 1, background: 'rgba(201,168,76,0.6)' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#c9a84c' }} />
            <div style={{ width: 120, height: 1, background: 'rgba(201,168,76,0.6)' }} />
          </div>
          <div style={{ fontSize: 44, color: '#c9a84c', letterSpacing: '0.18em', fontFamily: 'serif', textShadow: '0 1px 8px rgba(0,0,0,0.8)', marginBottom: 10 }}>
            {og.ogDate}
          </div>
          <div style={{ fontSize: 32, color: 'rgba(245,232,192,0.65)', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'serif', textShadow: '0 1px 6px rgba(0,0,0,0.8)' }}>
            {og.ogLocation}
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
