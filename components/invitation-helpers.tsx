'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'

// Shared scroll-invitation building blocks used by both the Berlin (ScrollInvitation)
// and Hindu (HinduScrollInvitation) invites. Kept identical to preserve look & feel.

export function useInView(ref: React.RefObject<HTMLElement | null>) {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.4 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [ref])
  return inView
}

export const Section = React.forwardRef<HTMLElement, { children: React.ReactNode; className?: string; style?: React.CSSProperties }>(
  ({ children, className = '', style }, ref) => (
    <section ref={ref} style={style} className={`relative h-[100dvh] w-full flex-shrink-0 overflow-hidden ${className}`}>
      {children}
    </section>
  )
)
Section.displayName = 'Section'

export function BgPhoto({ src, alt, position = 'center' }: { src: string; alt: string; position?: string }) {
  return (
    <>
      <Image src={src} alt={alt} fill className="object-cover" style={{ objectPosition: position }} sizes="100vw" unoptimized />
      <div className="absolute inset-0 bg-black/40" />
    </>
  )
}

export function FadeIn({ children, inView, delay = 0, className = '' }: {
  children: React.ReactNode; inView: boolean; delay?: number; className?: string
}) {
  return (
    <div
      className={`transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
