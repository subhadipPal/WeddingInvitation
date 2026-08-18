import type { Metadata } from 'next'

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000'

export const metadata: Metadata = {
  title: 'Julia & Subhadip — Save the Date · 22 & 23 January 2027',
  description: 'Save the Date — Julia Schulze & Subhadip Pal, Berlin, January 2027',
  openGraph: {
    title: 'Julia & Subhadip — Save the Date · 22 & 23 January 2027',
    description: 'Save the Date — Julia Schulze & Subhadip Pal, Berlin, January 2027',
    images: [{ url: `${baseUrl}/opengraph-image`, width: 1200, height: 630 }],
  },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
