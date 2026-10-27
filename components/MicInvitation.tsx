'use client'
import { useRef } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { Section, FadeIn, useInView } from './invitation-helpers'
import MicHamburgerMenu from './MicHamburgerMenu'
import MicRsvpForm from './MicRsvpForm'
import type { MicContentKey, MicImageSlot, MicImageVariant } from '@/lib/mic'
import { isToggleOn } from '@/lib/mic'

// Load animation overlays lazily so the main invite bundle stays small
const MicCurtainFrame = dynamic(() => import('./MicCurtainFrame'), { ssr: false })
const MicPetalOverlay = dynamic(() => import('./MicPetalOverlay'), { ssr: false })

type MicContent = Record<MicContentKey, string>
type MicImages = Partial<Record<MicImageSlot, Partial<Record<MicImageVariant, string>>>>

interface Props {
  content: MicContent
  images: MicImages
  guest: {
    name: string
    invitedDays: '22+23' | '23'
    isMulti: boolean
    micToken: string
    stdToken: string
  }
  existingRsvp: {
    attending22: boolean | null
    attending23: boolean | null
    address: string | null
    note: string | null
  } | null
  bakedHeroPath: string
}

function interp(template: string, name: string) {
  return template.replace('{name}', name)
}

/** Resolve the Google Maps route-planner link for an address string. */
function routeLink(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}

export default function MicInvitation({
  content,
  images,
  guest,
  existingRsvp,
  bakedHeroPath,
}: Props) {
  const showDay22 = guest.invitedDays === '22+23'
  const stdHref = `/de/invite/${guest.stdToken}`
  const showCurtain = isToggleOn(content, 'micEnableCurtain')
  const showPetals = isToggleOn(content, 'micEnablePetals')

  // Section refs — each self-manages its own fade-in via IntersectionObserver.
  const s1 = useRef<HTMLElement>(null)
  const s2 = useRef<HTMLElement>(null)
  const s3 = useRef<HTMLElement>(null)
  const s4 = useRef<HTMLElement>(null)
  const s5 = useRef<HTMLElement>(null)
  const s6 = useRef<HTMLElement>(null)

  const v1 = useInView(s1)
  const v2 = useInView(s2)
  const v3 = useInView(s3)
  const v4 = useInView(s4)
  const v5 = useInView(s5)
  const v6 = useInView(s6)

  // Hero: picture tag with mobile/tablet/desktop sources, fallback to baked default.
  const heroVariants = images.hero ?? {}
  const heroMobile = heroVariants.mobile ?? heroVariants.default ?? bakedHeroPath
  const heroTablet = heroVariants.tablet ?? heroVariants.default ?? bakedHeroPath
  const heroDesktop = heroVariants.desktop ?? heroVariants.default ?? bakedHeroPath

  const bodyFor22 = interp(
    guest.isMulti ? content.mic22BodyMulti : content.mic22Body,
    guest.name,
  )
  const bodyFor23 = interp(
    guest.isMulti ? content.mic23BodyMulti : content.mic23Body,
    guest.name,
  )

  return (
    <>
      {showCurtain && <MicCurtainFrame />}
      {showPetals && <MicPetalOverlay />}
      <MicHamburgerMenu stdHref={stdHref} openStdLabel={content.micMenuOpenStd} />

      <div
        className="h-[100dvh] overflow-y-scroll"
        style={{ scrollSnapType: 'y mandatory', scrollBehavior: 'smooth' }}
      >
        {/* ─── Section 1 — Hero ─── */}
        <Section ref={s1} style={{ scrollSnapAlign: 'start' }}>
          <picture>
            <source media="(min-width: 1025px)" srcSet={heroDesktop} />
            <source media="(min-width: 481px)" srcSet={heroTablet} />
            <source media="(max-width: 480px)" srcSet={heroMobile} />
            <Image
              src={bakedHeroPath}
              alt="Julia & Subhadip — Berlin meets Bengal"
              fill
              priority
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: 'center 55%' }}
              unoptimized
            />
          </picture>
          <div className="absolute inset-0 bg-black/15" />
          <div className="relative z-10 h-full flex flex-col items-center justify-end pb-16 px-6">
            <FadeIn inView={v1} delay={300}>
              <p className="font-serif text-[#c9a84c] text-sm sm:text-base tracking-widest uppercase text-center drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                {content.micHeroDate}
              </p>
            </FadeIn>
          </div>
          <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10 animate-bounce">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 5v14M5 12l7 7 7-7" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </Section>

        {/* ─── Section 2 — 22 Jan block (conditional) ─── */}
        {showDay22 && (
          <Section ref={s2} style={{ scrollSnapAlign: 'start' }}>
            <SectionBg url={images.day22Bg?.default} placeholder={content.micImagePlaceholder} />
            <div className="relative z-10 h-full overflow-y-auto px-6 py-12">
              <div className="max-w-md mx-auto flex flex-col gap-6">
                <FadeIn inView={v2}>
                  <p className="font-serif text-[#c9a84c] text-sm tracking-[0.4em] uppercase text-center">
                    {content.mic22Eyebrow}
                  </p>
                  <p className="font-script text-4xl text-[#c9a84c] text-center mt-2">
                    {content.mic22DateLine}
                  </p>
                  <div className="w-16 h-px bg-[#c9a84c]/40 mx-auto my-4" />
                </FadeIn>
                <FadeIn inView={v2} delay={200}>
                  <p className="font-serif text-[#f5f0e8]/90 text-base leading-relaxed whitespace-pre-wrap">
                    {bodyFor22}
                  </p>
                </FadeIn>
                <FadeIn inView={v2} delay={300}>
                  <TimetableCard heading={content.mic22TimetableHeading} body={content.mic22Timetable} />
                </FadeIn>
                <FadeIn inView={v2} delay={400}>
                  <VenueCard
                    name={content.mic22VenueVillaName}
                    address={content.mic22VenueVillaAddress}
                    routeLabel={content.mic22RouteButton}
                  />
                </FadeIn>
                <FadeIn inView={v2} delay={500}>
                  <VenueCard
                    name={content.mic22VenueHofName}
                    address={content.mic22VenueHofAddress}
                    routeLabel={content.mic22RouteButton}
                  />
                </FadeIn>
              </div>
            </div>
          </Section>
        )}

        {/* ─── Section 3 — 23 Jan block ─── */}
        <Section ref={s3} style={{ scrollSnapAlign: 'start' }}>
          <SectionBg url={images.day23Bg?.default} placeholder={content.micImagePlaceholder} />
          <div className="relative z-10 h-full overflow-y-auto px-6 py-12">
            <div className="max-w-md mx-auto flex flex-col gap-6">
              <FadeIn inView={v3}>
                <p className="font-serif text-[#c9a84c] text-sm tracking-[0.4em] uppercase text-center">
                  {content.mic23Eyebrow}
                </p>
                <p className="font-script text-4xl text-[#c9a84c] text-center mt-2">
                  {content.mic23DateLine}
                </p>
                <p className="font-script text-xl text-[#f5f0e8] text-center mt-1">
                  {content.mic23Tagline}
                </p>
                <div className="w-16 h-px bg-[#c9a84c]/40 mx-auto my-4" />
              </FadeIn>
              <FadeIn inView={v3} delay={200}>
                <p className="font-serif text-[#f5f0e8]/90 text-base leading-relaxed whitespace-pre-wrap">
                  {bodyFor23}
                </p>
              </FadeIn>
              <FadeIn inView={v3} delay={300}>
                <TimetableCard heading={content.mic23TimetableHeading} body={content.mic23Timetable} />
              </FadeIn>
              <FadeIn inView={v3} delay={400}>
                <VenueCard
                  name={content.mic23VenueName}
                  address={content.mic23VenueAddress}
                  routeLabel={content.mic22RouteButton}
                />
              </FadeIn>
            </div>
          </div>
        </Section>

        {/* ─── Section 4 — FAQ ─── */}
        <Section ref={s4} style={{ scrollSnapAlign: 'start' }}>
          <SectionBg url={images.faqBg?.default} placeholder={content.micImagePlaceholder} />
          <div className="relative z-10 h-full overflow-y-auto px-6 py-12">
            <div className="max-w-md mx-auto flex flex-col gap-4">
              <FadeIn inView={v4}>
                <p className="font-serif text-[#c9a84c] text-xs tracking-[0.4em] uppercase text-center mb-2">
                  {content.micFaqHeading}
                </p>
                <div className="w-16 h-px bg-[#c9a84c]/40 mx-auto mb-4" />
              </FadeIn>
              <FadeIn inView={v4} delay={150}>
                <FaqCard title={content.micFaqDressCodeTitle} body={content.micFaqDressCodeBody} />
              </FadeIn>
              <FadeIn inView={v4} delay={200}>
                <FaqCard title={content.micFaqGiftsTitle} body={content.micFaqGiftsBody} />
              </FadeIn>
              <FadeIn inView={v4} delay={250}>
                <FaqCard title={content.micFaqChildrenTitle} body={content.micFaqChildrenBody} />
              </FadeIn>
              <FadeIn inView={v4} delay={300}>
                <FaqCard
                  title={content.micFaqRsvpDeadlineTitle}
                  body={content.micFaqRsvpDeadlineBody}
                  accent
                />
              </FadeIn>
              <FadeIn inView={v4} delay={350}>
                <FaqCard title={content.micFaqPhotosTitle} body={content.micFaqPhotosBody} />
              </FadeIn>
            </div>
          </div>
        </Section>

        {/* ─── Section 5 — RSVP ─── */}
        <Section ref={s5} style={{ scrollSnapAlign: 'start' }}>
          <SectionBg url={images.rsvpBg?.default} placeholder={content.micImagePlaceholder} />
          <div className="relative z-10 h-full overflow-y-auto px-6 py-12 flex items-start sm:items-center justify-center">
            <FadeIn inView={v5} className="w-full">
              <MicRsvpForm
                micToken={guest.micToken}
                guestName={guest.name}
                isMulti={guest.isMulti}
                showDay22={showDay22}
                content={{
                  heading: content.micRsvpHeading,
                  greeting: content.micRsvpGreeting,
                  greetingMulti: content.micRsvpGreetingMulti,
                  question22: content.micRsvpQuestion22,
                  question23: content.micRsvpQuestion23,
                  yes: content.micRsvpYes,
                  no: content.micRsvpNo,
                  addressLabel: content.micRsvpAddressLabel,
                  addressPlaceholder: content.micRsvpAddressPlaceholder,
                  noteLabel: content.micRsvpNoteLabel,
                  notePlaceholder: content.micRsvpNotePlaceholder,
                  submit: content.micRsvpSubmit,
                  update: content.micRsvpUpdate,
                  confirmation: content.micRsvpConfirmation,
                  confirmationMulti: content.micRsvpConfirmationMulti,
                }}
                initialRsvp={existingRsvp}
              />
            </FadeIn>
          </div>
        </Section>

        {/* ─── Section 6 — Closing ─── */}
        <Section ref={s6} style={{ scrollSnapAlign: 'start' }}>
          <SectionBg url={images.closingBg?.default} placeholder={content.micImagePlaceholder} />
          <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center gap-6">
            <FadeIn inView={v6}>
              <p className="font-serif text-[#f5f0e8] text-base sm:text-lg leading-relaxed max-w-md whitespace-pre-wrap">
                {content.micClosingBody}
              </p>
            </FadeIn>
            <FadeIn inView={v6} delay={200}>
              <div className="w-16 h-px bg-[#c9a84c]/40" />
            </FadeIn>
            <FadeIn inView={v6} delay={400}>
              <p className="font-script text-4xl sm:text-5xl text-[#c9a84c]">
                {content.micClosingSign}
              </p>
              <p className="font-serif text-2xl text-[#c9a84c] mt-2">♥</p>
            </FadeIn>
          </div>
        </Section>
      </div>
    </>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

/** Section background: shows uploaded image if present, else a burgundy gradient
 *  with "Bild wird noch hochgeladen" overlay (very low opacity so it doesn't dominate). */
function SectionBg({ url, placeholder }: { url?: string; placeholder: string }) {
  if (url) {
    return (
      <>
        <Image src={url} alt="" fill className="object-cover" sizes="100vw" unoptimized />
        <div className="absolute inset-0 bg-black/55" />
      </>
    )
  }
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 20% 20%, #5a1010 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, #2a0505 0%, transparent 60%), #3a0808',
        }}
      />
      <p className="absolute bottom-3 right-4 font-serif text-[#f5f0e8]/15 text-[10px] tracking-wider italic">
        {placeholder}
      </p>
    </>
  )
}

const TIMETABLE_ICONS: [RegExp, string][] = [
  [/eintreff|ankommen|herzlich will/i, '🚶'],
  [/first look/i, '💑'],
  [/einlass/i, '🚪'],
  [/trauung|ja|zeremonie|ceremony/i, '💍'],
  [/glückwunsch|foto|photo|shooting/i, '📸'],
  [/essen|dinner|buffet|tisch|hof/i, '🍽️'],
  [/kaffee|torte|cake/i, '🎂'],
  [/ginergy|aperitif|sekt/i, '🥂'],
  [/tanz|dance|party/i, '💃'],
  [/feuerwerk/i, '🎆'],
]

function timetableIcon(label: string): string {
  for (const [re, icon] of TIMETABLE_ICONS) if (re.test(label)) return icon
  return '✨'
}

function TimetableCard({ heading, body }: { heading: string; body: string }) {
  const rows = body
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      // Accept any run of spaces or tabs as the separator between time and label
      const match = line.match(/^([^\t ]{2,12}(?:\s+Uhr)?)\s{2,}(.+)$/)
      if (match) return { time: match[1].trim(), label: match[2].trim() }
      // fallback: treat whole line as label
      return { time: '', label: line }
    })

  return (
    <div className="bg-black/40 backdrop-blur-sm border border-[#c9a84c]/30 rounded-xl p-4">
      <p className="font-serif text-[#c9a84c] text-[10px] uppercase tracking-widest mb-5 text-center">
        {heading}
      </p>
      <div className="relative max-h-[60vh] overflow-y-auto">
        {/* Centre vertical line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#c9a84c]/30 -translate-x-1/2" />

        <div className="flex flex-col gap-5">
          {rows.map((row, i) => {
            const icon = timetableIcon(row.label)
            const isLeft = i % 2 === 0
            return (
              <div key={i} className="relative flex items-center">
                {/* Left side */}
                <div className={`w-[calc(50%-16px)] ${isLeft ? 'flex flex-col items-end pr-3' : ''}`}>
                  {isLeft && (
                    <>
                      <span className="text-2xl leading-none">{icon}</span>
                      <span className="font-serif text-[#c9a84c] text-sm tracking-wider mt-0.5">{row.time}</span>
                      <span className="font-serif text-[#f5f0e8] text-sm text-right mt-0.5 leading-snug">{row.label}</span>
                    </>
                  )}
                </div>

                {/* Centre dot */}
                <div className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#c9a84c] border-2 border-[#1a0a0a] z-10 shrink-0" />

                {/* Right side */}
                <div className={`w-[calc(50%-16px)] ml-auto ${!isLeft ? 'flex flex-col items-start pl-3' : ''}`}>
                  {!isLeft && (
                    <>
                      <span className="text-2xl leading-none">{icon}</span>
                      <span className="font-serif text-[#c9a84c] text-sm tracking-wider mt-0.5">{row.time}</span>
                      <span className="font-serif text-[#f5f0e8] text-sm mt-0.5 leading-snug">{row.label}</span>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Known venue coordinates — OSM embed requires lat/lon, not text search.
// Add new entries here when addresses are confirmed.
const VENUE_COORDS: Record<string, { lat: number; lon: number }> = {
  'Teltower Damm 10, 14169 Berlin': { lat: 52.4342129, lon: 13.2590442 },
  'Clayallee 203, 14195 Berlin':    { lat: 52.4341308, lon: 13.246931  },
  'Hönower Str. 37, 12623 Berlin':  { lat: 52.5053471, lon: 13.6210425 },
}
const OSM_DELTA = 0.003 // ~300 m bbox half-width

function venueMapSrc(address: string): string | null {
  const coords = VENUE_COORDS[address.trim()]
  if (!coords) return null
  const { lat, lon } = coords
  const bbox = `${lon - OSM_DELTA},${lat - OSM_DELTA},${lon + OSM_DELTA},${lat + OSM_DELTA}`
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`
}

function VenueCard({ name, address, routeLabel }: { name: string; address: string; routeLabel: string }) {
  const hasAddress = address && !address.toLowerCase().includes('folgt')
  const osmSrc = hasAddress ? venueMapSrc(address) : null

  return (
    <div className="bg-black/40 backdrop-blur-sm border border-[#c9a84c]/30 rounded-xl overflow-hidden flex flex-col">
      {osmSrc && (
        <iframe
          src={osmSrc}
          width="100%"
          height="140"
          loading="lazy"
          title={`Karte: ${name}`}
          className="w-full border-0 opacity-90"
          style={{ colorScheme: 'normal' }}
        />
      )}
      <div className="p-4 flex flex-col gap-3">
        <div>
          <p className="font-serif text-[#c9a84c] text-sm uppercase tracking-widest mb-1">📍 {name}</p>
          <p className="font-serif text-[#f5f0e8] text-base whitespace-pre-wrap">{address}</p>
        </div>
        {hasAddress && (
          <a
            href={routeLink(address)}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start px-3 py-1.5 rounded-lg border border-[#c9a84c]/50 bg-[#c9a84c]/10 text-[#c9a84c] font-serif text-xs hover:bg-[#c9a84c]/20 transition-colors"
          >
            {routeLabel}
          </a>
        )}
      </div>
    </div>
  )
}

function FaqCard({ title, body, accent }: { title: string; body: string; accent?: boolean }) {
  return (
    <div
      className={`backdrop-blur-sm rounded-xl p-4 ${
        accent
          ? 'bg-[#c9a84c]/15 border-2 border-[#c9a84c]/70 shadow-[0_0_20px_rgba(201,168,76,0.3)]'
          : 'bg-black/40 border border-[#c9a84c]/30'
      }`}
    >
      <p className="font-script text-xl text-[#c9a84c] mb-2">{title}</p>
      <p className="font-serif text-[#f5f0e8] text-base leading-relaxed whitespace-pre-wrap">
        {body}
      </p>
    </div>
  )
}
