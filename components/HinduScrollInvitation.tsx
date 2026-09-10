'use client'
import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type { Lang, Translations } from '@/lib/i18n'
import { Section, BgPhoto, FadeIn, useInView } from './invitation-helpers'
import MandalaDecor from './MandalaDecor'
import EnvelopeAnimation from './EnvelopeAnimation'
import CountdownTimer from './CountdownTimer'
import LanguageToggle from './LanguageToggle'
import MusicPlayer from './MusicPlayer'
import RsvpForm from './RsvpForm'

interface Guest {
  name: string
  token: string
  isMulti?: boolean
  isBengali?: boolean
}

interface RsvpData {
  attending28: boolean | null
  note: string | null
}

interface Props {
  lang: Lang
  translations: Translations
  photos: string[]
  guest?: Guest
  existingRsvp?: RsvpData | null
}

// Temple location — Sri Sri Karunamoyee Kali Temple, Kolkata
const VENUE_LAT = 22.4859647
const VENUE_LNG = 88.3396868
const MAP_EMBED = `https://www.google.com/maps?q=${VENUE_LAT},${VENUE_LNG}&z=16&output=embed`
const MAP_DIRECTIONS = `https://www.google.com/maps/dir/?api=1&destination=${VENUE_LAT}%2C${VENUE_LNG}`
// 28 Jan 2027, 5:30 PM IST
const HINDU_DATE = new Date('2027-01-28T17:30:00+05:30')

// BN gets plural forms same as DE on the Berlin invite; EN stays singular
function tv(lang: Lang, isMulti: boolean, singular: string, multi: string) {
  return isMulti && lang !== 'en' ? multi : singular
}

export default function HinduScrollInvitation({ lang, translations, photos, guest, existingRsvp }: Props) {
  const isMulti = guest?.isMulti ?? false
  const langs: Lang[] = guest?.isBengali ? ['en', 'bn'] : ['en']

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

  const bgHero    = '/photos/background.jpeg'
  const bgHeart   = photos.find(p => p.includes('8417a217')) ?? photos[0]
  const bgDate    = '/photos/rose/bouquet.jpeg'

  const galleryFacePos: Record<string, string> = {
    'b683c955': 'center top',
    '59dd1985': 'center top',
    '0a9f1e4a': 'center 30%',
    '03d515ce': 'center 55%',
    'ae20cb46': 'center 55%',
  }
  const galleryPhotos = photos.filter(p =>
    ['b683c955', '59dd1985', '0a9f1e4a', '03d515ce', 'ae20cb46'].some(id => p.includes(id))
  ).slice(0, 5)

  const [galleryIdx, setGalleryIdx] = useState(0)
  useEffect(() => {
    if (!v4) return
    const id = setInterval(() => setGalleryIdx(i => (i + 1) % galleryPhotos.length), 3000)
    return () => clearInterval(id)
  }, [v4, galleryPhotos.length])

  // Envelope reads translations.tapToOpen — override with the Hindu label so the shared
  // EnvelopeAnimation shows 28-Jan copy without any change to that component.
  const envelopeTranslations: Translations = { ...translations, tapToOpen: translations.hindu_tapToOpen }

  return (
    <>
      <div
        className="h-[100dvh] overflow-y-scroll"
        style={{ scrollSnapType: 'y mandatory', scrollBehavior: 'smooth' }}
      >
        {/* Section 1: Hero + Envelope */}
        <Section ref={s1} style={{ scrollSnapAlign: 'start' }}>
          <BgPhoto src={bgHero} alt="Wedding venue" position="center top" />
          <MandalaDecor />
          <div className="absolute top-4 right-4 z-20">
            <LanguageToggle lang={lang} token={guest?.token} langs={langs} />
          </div>
          <div className="relative z-10 h-full flex flex-col items-center justify-center gap-3 px-6 overflow-y-auto py-16 sm:py-8">
            <FadeIn inView={v1} delay={0}>
              <p className="font-serif text-[#c9a84c]/70 text-[10px] tracking-[0.5em] uppercase text-center">
                {translations.hindu_saveTheDate}
              </p>
            </FadeIn>
            <FadeIn inView={v1} delay={150}>
              <h1 className="font-script text-[2rem] sm:text-4xl md:text-6xl text-[#c9a84c] text-center leading-tight">
                Julia<br />&<br />Subhadip
              </h1>
            </FadeIn>
            <FadeIn inView={v1} delay={250}>
              <p className="font-serif text-[#f5f0e8]/40 text-xs tracking-widest uppercase">{translations.hindu_inviteDate}</p>
            </FadeIn>
            <div className="w-16 h-px bg-[#c9a84c]/40 my-1" />
            <FadeIn inView={v1} delay={350}>
              <EnvelopeAnimation
                lang={lang}
                translations={envelopeTranslations}
                invitedDays="28"
                isMulti={isMulti}
                onScrollToRsvp={() => s5.current?.scrollIntoView({ behavior: 'smooth' })}
              />
            </FadeIn>
          </div>
          <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10 animate-bounce">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12l7 7 7-7" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </Section>

        {/* Section 2: Invitation body */}
        <Section ref={s2} style={{ scrollSnapAlign: 'start' }}>
          <BgPhoto src={bgHeart} alt="Julia und Subhadip" position="center 30%" />
          <div className="relative z-10 h-full flex flex-col items-center justify-center gap-5 px-8 text-center">
            <FadeIn inView={v2} delay={0}>
              {guest ? (
                <p className="font-script text-4xl sm:text-5xl text-[#f5f0e8]">
                  {tv(lang, isMulti, translations.hindu_rsvpGreeting, translations.hindu_rsvpGreetingMulti)} {guest.name}!
                </p>
              ) : (
                <p className="font-script text-5xl sm:text-7xl text-[#f5f0e8]">
                  {translations.hindu_inviteHeading}
                </p>
              )}
            </FadeIn>
            <FadeIn inView={v2} delay={200}>
              <div className="w-20 h-px bg-[#c9a84c]/70" />
            </FadeIn>
            <FadeIn inView={v2} delay={350}>
              <p className="font-serif text-[#f5f0e8]/90 text-sm sm:text-base leading-relaxed max-w-sm">
                {tv(lang, isMulti, translations.hindu_inviteBody, translations.hindu_inviteBodyMulti)}
              </p>
            </FadeIn>
            <FadeIn inView={v2} delay={500}>
              <p className="font-script text-2xl text-[#c9a84c]">{translations.hindu_inviteClosing}</p>
            </FadeIn>
          </div>
        </Section>

        {/* Section 3: Date + Time + Countdown */}
        <Section ref={s3} style={{ scrollSnapAlign: 'start' }}>
          <BgPhoto src={bgDate} alt="Roses" position="center center" />
          <div className="relative z-10 h-full flex flex-col items-center justify-center gap-6 px-8 text-center">
            <FadeIn inView={v3} delay={0}>
              <p className="font-serif text-[#c9a84c] text-xs tracking-[0.4em] uppercase">
                {translations.hindu_calendarLabel}
              </p>
            </FadeIn>
            <FadeIn inView={v3} delay={200}>
              <div className="bg-black/40 backdrop-blur-sm border border-[#c9a84c]/40 rounded-2xl px-8 py-6 flex flex-col gap-3">
                <p className="font-script text-3xl sm:text-4xl text-[#c9a84c]">{translations.hindu_inviteDate}</p>
                <div className="w-full h-px bg-[#c9a84c]/30" />
                <p className="font-serif text-[#f5f0e8]/70 text-sm tracking-widest">{translations.hindu_venueName}</p>
              </div>
            </FadeIn>
            <FadeIn inView={v3} delay={400}>
              <CountdownTimer lang={lang} translations={translations} targetDate={HINDU_DATE} />
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
                  <Image src={src} alt={`Julia & Subhadip ${i + 1}`} fill className="object-cover" style={{ objectPosition: Object.entries(galleryFacePos).find(([id]) => src.includes(id))?.[1] ?? 'center top' }} unoptimized />
                </div>
              ))}
              <div className="absolute inset-0 bg-black/40" />
            </>
          )}
          <div className="relative z-10 h-full flex flex-col items-end justify-end p-8">
            <FadeIn inView={v4} delay={200} className="text-right">
              <p className="font-script text-4xl sm:text-5xl text-[#f5f0e8]">Julia & Subhadip</p>
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

        {/* Section 5: Venue + Map + RSVP */}
        <Section ref={s5} style={{ scrollSnapAlign: 'start' }}>
          <BgPhoto src={bgHero} alt="Julia und Subhadip" position="center top" />
          <div className="relative z-10 h-full flex flex-col items-center justify-start gap-4 px-6 text-center overflow-y-auto py-12">
            {/* Venue + map + directions */}
            <FadeIn inView={v5} delay={0} className="w-full max-w-sm">
              <p className="font-script text-3xl sm:text-4xl text-[#c9a84c] mb-1">{translations.hindu_venueName}</p>
              <p className="font-serif text-[#f5f0e8]/70 text-sm mb-3">{translations.hindu_venueAddress}</p>
              <div className="rounded-xl overflow-hidden border border-[#c9a84c]/40 shadow-2xl">
                <iframe
                  title={translations.hindu_venueName}
                  src={MAP_EMBED}
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <a
                href={MAP_DIRECTIONS}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 bg-[#c9a84c] text-[#1a0a0a] font-serif font-semibold px-5 py-2.5 rounded-xl hover:bg-[#c9a84c]/80 transition-colors"
              >
                📍 {translations.hindu_venueDirections}
              </a>
            </FadeIn>

            {/* RSVP */}
            {guest && (
              <FadeIn inView={v5} delay={150} className="w-full max-w-sm">
                <p className="font-script text-2xl text-[#c9a84c] mt-2 mb-1">
                  {tv(lang, isMulti, translations.hindu_rsvpQuestion, translations.hindu_rsvpQuestionMulti)}
                </p>
                <RsvpForm
                  token={guest.token}
                  invitedDays="28"
                  lang={lang}
                  translations={{
                    ...translations,
                    rsvpYes: tv(lang, isMulti, translations.hindu_rsvpYes, translations.hindu_rsvpYesMulti),
                    rsvpNo: translations.hindu_rsvpNo,
                    rsvpNote: translations.hindu_rsvpNote,
                    rsvpNotePlaceholder: translations.hindu_rsvpNotePlaceholder,
                    rsvpSubmit: translations.hindu_rsvpSubmit,
                    rsvpUpdate: translations.hindu_rsvpUpdate,
                    rsvpConfirmation: tv(lang, isMulti, translations.hindu_rsvpConfirmation, translations.hindu_rsvpConfirmationMulti),
                  }}
                  existingRsvp={existingRsvp ? { attending22: null, attending23: null, attending28: existingRsvp.attending28, note: existingRsvp.note } : null}
                />
              </FadeIn>
            )}
          </div>
        </Section>
      </div>

      <MusicPlayer />
    </>
  )
}
