import type { Metadata } from 'next'
import { Great_Vibes, Cormorant_Garamond } from 'next/font/google'
import './globals.css'

const greatVibes = Great_Vibes({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-script',
})

const cormorant = Cormorant_Garamond({
  weight: ['300', '400', '600'],
  subsets: ['latin'],
  variable: '--font-serif',
})

export const metadata: Metadata = {
  title: 'Julia & Ravi — Save the Date · 22 & 23 January 2027',
  description: 'Save the Date — Julia Schulze & Subhadip Pal, Berlin, January 2027',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className={`${greatVibes.variable} ${cormorant.variable} bg-[#1a0a0a] text-[#f5f0e8]`}>
        {children}
      </body>
    </html>
  )
}
