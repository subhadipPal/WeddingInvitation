'use client'
import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type { Lang, Translations } from '@/lib/i18n'
import MandalaDecor from './MandalaDecor'
import EnvelopeAnimation from './EnvelopeAnimation'
import CountdownTimer from './CountdownTimer'
import LanguageToggle from './LanguageToggle'
import MusicPlayer from './MusicPlayer'
import RsvpForm from './RsvpForm'

interface Guest {
  name: string
  invitedDays: '22+23' | '23'
  token: string
}

interface RsvpData {
  attending22: boolean | null
  attending23: boolean
  note: string | null
}

interface Props {
  lang: Lang
  translations: Translations
  photos: string[]
  guest?: Guest
  existingRsvp?: RsvpData | null
}

function useInView(ref: React.RefObject<HTMLElement | null>) {
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

const Section = React.forwardRef<HTMLElement, { children: React.ReactNode; className?: string; style?: React.CSSProperties }>(
  ({ children, className = '', style }, ref) => (
    <section ref={ref} style={style} className={`relative h-[100dvh] w-full flex-shrink-0 overflow-hidden ${className}`}>
      {children}
    </section>
  )
)
Section.displayName = 'Section'

function BgPhoto({ src, alt, position = 'center' }: { src: string; alt: string; position?: string }) {
  return (
    <>
      <Image src={src} alt={alt} fill className="object-cover" style={{ objectPosition: position }} sizes="100vw" unoptimized />
      <div className="absolute inset-0 bg-black/40" />
    </>
  )
}

function FadeIn({ children, inView, delay = 0, className = '' }: {
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

export default function ScrollInvitation({ lang, translations, photos, guest, existingRsvp }: Props) {
  const s1 = useRef<HTMLElement>(null)
  const s2 = useRef<HTMLElement>(null)
  const s3 = useRef<HTMLElement>(null)
  const s4 = useRef<HTMLElement>(null)
  const s5 = useRef<HTMLElement>(null)

  const v1 = useInView(s1)
  const v2 = useInView(s2)
  const v3 = useInView(s3)
  const v4 = useInView(s4)
  const v5 = useInView(s5)

  const bgHero     = '/photos/background.jpeg'
  const bgHeart    = photos.find(p => p.includes('8417a217')) ?? photos[0]
  const bgDate     = '/photos/rose/bouquet.jpeg'
  const bgGallery  = photos.find(p => p.includes('e323de13')) ?? photos[2]
  const bgClosing  = '/photos/background.jpeg'
  const galleryPhotos = photos.filter(p =>
    ['b683c955','59dd1985','0a9f1e4a','03d515ce','ae20cb46'].some(id => p.includes(id))
  ).slice(0, 5)

  void bgGallery

  const [galleryIdx, setGalleryIdx] = useState(0)
  useEffect(() => {
    if (!v4) return
    const id = setInterval(() => setGalleryIdx(i => (i + 1) % galleryPhotos.length), 3000)
    return () => clearInterval(id)
  }, [v4, galleryPhotos.length])

  return (
    <>
      <div
        className="h-[100dvh] overflow-y-scroll"
        style={{ scrollSnapType: 'y mandatory', scrollBehavior: 'smooth' }}
      >
        {/* Section 1: Hero */}
        <Section ref={s1} style={{ scrollSnapAlign: 'start' }}>
          <BgPhoto src={bgHero} alt="Wedding venue" position="center top" />
          <MandalaDecor />
          <div className="absolute top-4 right-4 z-20">
            <LanguageToggle lang={lang} token={guest?.token} />
          </div>
          <div className="relative z-10 h-full flex flex-col items-center justify-center gap-3 px-6">
            <FadeIn inView={v1} delay={0}>
              <p className="font-serif text-[#c9a84c]/70 text-[10px] tracking-[0.5em] uppercase text-center">
                {translations.saveTheDate}
              </p>
            </FadeIn>
            <FadeIn inView={v1} delay={150}>
              <h1 className="font-script text-4xl sm:text-6xl text-[#c9a84c] text-center leading-tight">
                {translations.coupleNames.replace(' & ', '\n&\n').split('\n').map((part, i) =>
                  i === 1 ? <React.Fragment key={i}><br />{part}<br /></React.Fragment> : <React.Fragment key={i}>{part}</React.Fragment>
                )}
              </h1>
            </FadeIn>
            <FadeIn inView={v1} delay={250}>
              <p className="font-serif text-[#f5f0e8]/40 text-xs tracking-widest uppercase">aka Ravi</p>
            </FadeIn>
            <div className="w-16 h-px bg-[#c9a84c]/40 my-1" />
            <FadeIn inView={v1} delay={350}>
              <EnvelopeAnimation lang={lang} translations={translations} />
            </FadeIn>
          </div>
          <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10 animate-bounce">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12l7 7 7-7" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </Section>

        {/* Section 2: Invitation body */}
        <Section ref={s2} style={{ scrollSnapAlign: 'start' }}>
          <BgPhoto src={bgHeart} alt="Julia und Ravi" position="center 20%" />
          <div className="relative z-10 h-full flex flex-col items-center justify-center gap-5 px-8 text-center">
            <FadeIn inView={v2} delay={0}>
              {guest ? (
                <p className="font-script text-4xl sm:text-5xl text-[#f5f0e8]">
                  {translations.rsvpGreeting} {guest.name}!
                </p>
              ) : (
                <p className="font-script text-5xl sm:text-7xl text-[#f5f0e8]">
                  {translations.inviteHeading}
                </p>
              )}
            </FadeIn>
            <FadeIn inView={v2} delay={200}>
              <div className="w-20 h-px bg-[#c9a84c]/70" />
            </FadeIn>
            <FadeIn inView={v2} delay={350}>
              <p className="font-serif text-[#f5f0e8]/90 text-sm sm:text-base leading-relaxed max-w-sm">
                {guest
                  ? (guest.invitedDays === '22+23' ? translations.inviteBody22and23 : translations.inviteBody23only)
                  : translations.inviteBody23only}
              </p>
            </FadeIn>
            <FadeIn inView={v2} delay={500}>
              <p className="font-script text-2xl text-[#c9a84c]">{translations.inviteClosing}</p>
            </FadeIn>
          </div>
        </Section>

        {/* Section 3: Date */}
        <Section ref={s3} style={{ scrollSnapAlign: 'start' }}>
          <BgPhoto src={bgDate} alt="Roses" position="center center" />
          <div className="relative z-10 h-full flex flex-col items-center justify-center gap-6 px-8 text-center">
            <FadeIn inView={v3} delay={0}>
              <p className="font-serif text-[#c9a84c] text-xs tracking-[0.4em] uppercase">
                {translations.calendarLabel}
              </p>
            </FadeIn>
            <FadeIn inView={v3} delay={200}>
              <div className="bg-black/40 backdrop-blur-sm border border-[#c9a84c]/40 rounded-2xl px-8 py-6 flex flex-col gap-3">
                <p className="font-script text-3xl sm:text-4xl text-[#c9a84c]">{translations.inviteDate22}</p>
                <div className="w-full h-px bg-[#c9a84c]/30" />
                <p className="font-script text-3xl sm:text-4xl text-[#c9a84c]">{translations.inviteDate23}</p>
                <div className="w-full h-px bg-[#c9a84c]/30" />
                <p className="font-serif text-[#f5f0e8]/70 text-sm tracking-widest uppercase">Berlin</p>
              </div>
            </FadeIn>
            <FadeIn inView={v3} delay={400}>
              <CountdownTimer lang={lang} translations={translations} />
            </FadeIn>
          </div>
        </Section>

        {/* Section 4: Gallery */}
        <Section ref={s4} style={{ scrollSnapAlign: 'start' }}>
          {galleryPhotos.length > 0 && (
            <>
              {galleryPhotos.map((src, i) => (
                <div
                  key={src}
                  className={`absolute inset-0 transition-opacity duration-1000 ${i === galleryIdx ? 'opacity-100' : 'opacity-0'}`}
                >
                  <Image src={src} alt={`Julia & Ravi ${i + 1}`} fill className="object-cover" unoptimized />
                </div>
              ))}
              <div className="absolute inset-0 bg-black/40" />
            </>
          )}
          <div className="relative z-10 h-full flex flex-col items-end justify-end p-8">
            <FadeIn inView={v4} delay={200} className="text-right">
              <p className="font-script text-4xl sm:text-5xl text-[#f5f0e8]">Julia & Ravi</p>
              <p className="font-serif text-[#c9a84c] text-sm tracking-widest uppercase mt-1">2027</p>
            </FadeIn>
            <div className="flex gap-2 mt-4">
              {galleryPhotos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setGalleryIdx(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${i === galleryIdx ? 'bg-[#c9a84c]' : 'bg-white/40'}`}
                />
              ))}
            </div>
          </div>
        </Section>

        {/* Section 5: Closing / RSVP */}
        <Section ref={s5} style={{ scrollSnapAlign: 'start' }}>
          <BgPhoto src={bgClosing} alt="Julia und Ravi" position="center top" />
          <div className="relative z-10 h-full flex flex-col items-center justify-center gap-4 px-6 text-center overflow-y-auto py-12">
            {guest ? (
              <>
                <FadeIn inView={v5} delay={0}>
                  <p className="font-script text-3xl text-[#c9a84c]">{translations.rsvpQuestion}</p>
                </FadeIn>
                <FadeIn inView={v5} delay={150} className="w-full max-w-sm">
                  <RsvpForm
                    token={guest.token}
                    guestName={guest.name}
                    invitedDays={guest.invitedDays}
                    lang={lang}
                    translations={translations}
                    existingRsvp={existingRsvp}
                  />
                </FadeIn>
              </>
            ) : (
              <>
                <FadeIn inView={v5} delay={0}>
                  <p className="font-script text-4xl sm:text-6xl text-[#f5f0e8]">Julia & Ravi</p>
                </FadeIn>
                <FadeIn inView={v5} delay={200}>
                  <div className="w-20 h-px bg-[#c9a84c]/70" />
                </FadeIn>
                <FadeIn inView={v5} delay={350}>
                  <p className="font-serif text-[#f5f0e8]/80 text-base max-w-sm leading-relaxed">
                    {translations.noGuestClosingBody}
                  </p>
                </FadeIn>
                <FadeIn inView={v5} delay={500}>
                  <p className="font-script text-2xl text-[#c9a84c]">
                    {translations.noGuestClosingSign} ♥
                  </p>
                </FadeIn>
              </>
            )}
          </div>
        </Section>
      </div>

      <MusicPlayer />
    </>
  )
}
