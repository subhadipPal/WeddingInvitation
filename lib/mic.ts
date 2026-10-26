// MIC (Marriage Invitation Card) — DE-only content keys + defaults.
//
// Defaults are the authoritative text from docs/MarriageInvitationCard/Specifications.md.
// Admin can override every value via /api/mic-content (POST), stored in `mic_content`.
//
// Keep this file isolated from lib/i18n.ts (STD/Hindu). Zero shared types or arrays.
// If a key needs editing, change ONLY the default below; the admin-set value in DB
// takes precedence at render time.

import { customAlphabet } from 'nanoid'

// ── Token generation ──────────────────────────────────────────────────────────

const alphabet = '23456789abcdefghjkmnpqrstuvwxyz'
const nanoid12 = customAlphabet(alphabet, 12)

/** Generates a 12-char MIC token (alphabet matches STD, length is 12 so MIC tokens
 *  are visually distinguishable from STD 8-char tokens). */
export function generateMicToken(): string {
  return nanoid12()
}

// ── Content keys ──────────────────────────────────────────────────────────────
//
// String union = single source of truth. The DB only ever stores keys from this
// union. The admin UI iterates this union. The MIC page reads via this union.

export const MIC_CONTENT_KEYS = [
  // Hero — the baked image carries the title. HTML overlays only the date.
  'micHeroDate',

  // 22 Jan block
  'mic22Eyebrow',       // "FREITAG"
  'mic22DateLine',      // "22. Januar 2027"
  'mic22Body',          // Personalized body (singular Du-form)
  'mic22BodyMulti',     // Multi-person variant (Ihr-form)
  'mic22TimetableHeading', // "ABLAUF"
  'mic22Timetable',     // Multiline schedule
  'mic22VenueVillaName',    // "HOCHZEITSVILLA ZEHLENDORF"
  'mic22VenueVillaAddress', // "Teltower Damm 10, 14169 Berlin"
  'mic22VenueHofName',      // "ZEHLENDORFER HOF"
  'mic22VenueHofAddress',   // Address placeholder
  'mic22RouteButton',   // "Route planen →"

  // 23 Jan block
  'mic23Eyebrow',       // "SAMSTAG"
  'mic23DateLine',      // "23. Januar 2027"
  'mic23Tagline',       // "Berlin meets Bengal"
  'mic23Body',
  'mic23BodyMulti',
  'mic23TimetableHeading',
  'mic23Timetable',
  'mic23VenueName',     // "ESSZIMMER MAHLSDORF"
  'mic23VenueAddress',

  // FAQ
  'micFaqHeading',      // "HÄUFIGE FRAGEN"
  'micFaqDressCodeTitle',
  'micFaqDressCodeBody',
  'micFaqGiftsTitle',
  'micFaqGiftsBody',
  'micFaqChildrenTitle',
  'micFaqChildrenBody',
  'micFaqRsvpDeadlineTitle',
  'micFaqRsvpDeadlineBody',
  'micFaqPhotosTitle',
  'micFaqPhotosBody',

  // RSVP form labels
  'micRsvpHeading',     // "RÜCKMELDUNG"
  'micRsvpGreeting',    // "Liebe/r {name}," (singular)
  'micRsvpGreetingMulti', // Multi variant
  'micRsvpQuestion22',  // "Am 22. Januar dabei?"
  'micRsvpQuestion23',  // "Am 23. Januar dabei?"
  'micRsvpYes',
  'micRsvpNo',
  'micRsvpAddressLabel',
  'micRsvpAddressPlaceholder',
  'micRsvpNoteLabel',
  'micRsvpNotePlaceholder',
  'micRsvpSubmit',
  'micRsvpUpdate',
  'micRsvpConfirmation',
  'micRsvpConfirmationMulti',

  // Closing
  'micClosingBody',
  'micClosingSign',

  // Hamburger menu
  'micMenuOpenStd',     // "Save-the-Date öffnen"

  // Toggles (stored as 'true' / 'false' strings)
  'micEnableCurtain',
  'micEnablePetals',

  // Hero + section placeholder label (when no image uploaded yet)
  'micImagePlaceholder',

  // Invalid-token page
  'micInvalidTokenBody',
] as const

export type MicContentKey = typeof MIC_CONTENT_KEYS[number]

// ── Defaults (German) ─────────────────────────────────────────────────────────
// Sourced from docs/MarriageInvitationCard/Specifications.md. Edit here to change
// the baked-in default; admins override via /api/mic-content.

export const MIC_DEFAULTS: Record<MicContentKey, string> = {
  // Hero
  micHeroDate: '22. und 23. Januar 2027',

  // 22 Jan — civil ceremony at Hochzeitsvilla Zehlendorf
  mic22Eyebrow: 'FREITAG',
  mic22DateLine: '22. Januar 2027',
  mic22Body:
    'Liebe/r {name},\n\nwir freuen uns, Dich zu unserer standesamtlichen Trauung in der Hochzeitsvilla Zehlendorf einzuladen. Nach der Zeremonie geht es zum gemeinsamen Hochzeitsessen in den Zehlendorfer Hof.',
  mic22BodyMulti:
    'Liebe {name},\n\nwir freuen uns, Euch zu unserer standesamtlichen Trauung in der Hochzeitsvilla Zehlendorf einzuladen. Nach der Zeremonie geht es zum gemeinsamen Hochzeitsessen in den Zehlendorfer Hof.',
  mic22TimetableHeading: 'ABLAUF',
  mic22Timetable: [
    '11:15 Uhr   Eintreffen vor der Hochzeitsvilla',
    '11:20 Uhr   First Look',
    '11:40 Uhr   Gemeinsamer Einlass',
    '12:00 Uhr   Standesamtliche Trauung',
    '13:00 Uhr   Hochzeitsessen im Zehlendorfer Hof',
  ].join('\n'),
  mic22VenueVillaName: 'HOCHZEITSVILLA ZEHLENDORF',
  mic22VenueVillaAddress: 'Teltower Damm 10, 14169 Berlin',
  mic22VenueHofName: 'ZEHLENDORFER HOF',
  mic22VenueHofAddress: 'Adresse — folgt',
  mic22RouteButton: 'Route planen →',

  // 23 Jan — reception at Esszimmer Mahlsdorf
  mic23Eyebrow: 'SAMSTAG',
  mic23DateLine: '23. Januar 2027',
  mic23Tagline: 'Berlin meets Bengal',
  mic23Body:
    'Liebe/r {name},\n\nam Samstag feiern wir mit Dir unsere Hochzeit — mit einem Dinner, das deutsches Abendbrot und ein warmes indisches Buffet vereint, Hochzeitstorte, Reden, unserem Hochzeitstanz und einer langen Partynacht.',
  mic23BodyMulti:
    'Liebe {name},\n\nam Samstag feiern wir mit Euch unsere Hochzeit — mit einem Dinner, das deutsches Abendbrot und ein warmes indisches Buffet vereint, Hochzeitstorte, Reden, unserem Hochzeitstanz und einer langen Partynacht.',
  mic23TimetableHeading: 'ABLAUF',
  mic23Timetable: [
    '14:00 Uhr   Herzlich willkommen',
    '14:30 Uhr   Großer Auftritt, Begrüßung, Eheversprechen',
    '15:30 Uhr   Kaffee & Hochzeitstorte',
    '16:30 Uhr   Fotoshooting mit Patrick',
    '18:00 Uhr   Dinner — Berlin meets Bengal',
    '19:30 Uhr   Ginergy tanken!',
    '20:00 Uhr   Unser Hochzeitstanz',
    'danach      Familientanz & Partynacht',
  ].join('\n'),
  mic23VenueName: 'ESSZIMMER MAHLSDORF',
  mic23VenueAddress: 'Adresse — folgt',

  // FAQ
  micFaqHeading: 'HÄUFIGE FRAGEN',
  micFaqDressCodeTitle: 'Was sollen wir anziehen?',
  micFaqDressCodeBody:
    'So bunt und vielfältig wie unsere Gäste! Ob klassisch-elegante Hochzeitsgarderobe oder traditionelle indische Festkleidung — bei uns ist alles herzlich willkommen.\n\nBitte vermeidet nur drei Farben:\n🤍 Weiß — der Braut vorbehalten.\n❤️ Rot — in der bengalischen Hochzeitstradition ebenfalls der Braut vorbehalten.\n🖤 Schwarz — das überlassen wir der Trauer.\n\nAnsonsten: Seid festlich, seid farbenfroh und vor allem seid ihr selbst!',
  micFaqGiftsTitle: 'Was wünscht ihr euch?',
  micFaqGiftsBody:
    'Das größte Geschenk ist für uns, diesen besonderen Tag mit euch zu feiern! Unser Zuhause ist bereits gut gefüllt. Wenn ihr uns dennoch eine Freude machen möchtet, freuen wir uns über einen kleinen Beitrag zu unserer Flitterwochenkasse — so schenkt ihr uns unvergessliche gemeinsame Erinnerungen.',
  micFaqChildrenTitle: 'Sind Kinder willkommen?',
  micFaqChildrenBody:
    'Wir lieben Kinder! Dennoch ist unsere Hochzeitsfeier in erster Linie für Erwachsene geplant — vor Ort gibt es keine Kinderbetreuung und keine Spielangebote. Wenn ihr für euren Nachwuchs eine liebevolle Betreuung organisieren könnt, würde uns das sehr freuen. Falls das nicht möglich ist, sprecht uns bitte persönlich an — wir finden gemeinsam eine Lösung.',
  micFaqRsvpDeadlineTitle: 'Bis wann müssen wir zusagen?',
  micFaqRsvpDeadlineBody:
    'Damit wir gut planen können, bitten wir Euch um Eure Rückmeldung bis spätestens **15. Januar 2027**. Die Rückmeldung könnt ihr direkt über diese Seite abgeben. Sollten wir bis zum 15. Januar keine Nachricht erhalten, gehen wir leider von einer Absage aus. Vielen Dank für Euer Verständnis!',
  micFaqPhotosTitle: 'Dürfen wir Fotos und Videos machen?',
  micFaqPhotosBody:
    'Unbedingt! Haltet unsere Hochzeit gerne aus eurer persönlichen Perspektive fest.\n\nAmazon Photos: Link folgt — hier könnt ihr eure schönsten Bilder hochladen und die Erinnerungen der anderen Gäste entdecken.\n\nWhatsApp: Teilt eure Aufnahmen gerne in unserer WhatsApp-Gruppe oder schickt sie uns direkt. Über kleine Videobotschaften freuen wir uns besonders.',

  // RSVP form
  micRsvpHeading: 'RÜCKMELDUNG',
  micRsvpGreeting: 'Liebe/r {name},',
  micRsvpGreetingMulti: 'Liebe {name},',
  micRsvpQuestion22: 'Am 22. Januar dabei?',
  micRsvpQuestion23: 'Am 23. Januar dabei?',
  micRsvpYes: 'Ja',
  micRsvpNo: 'Nein',
  micRsvpAddressLabel: 'Adresse (für Postversand, optional)',
  micRsvpAddressPlaceholder: 'Straße, PLZ, Ort',
  micRsvpNoteLabel: 'Notiz an Julia & Subhadip (optional)',
  micRsvpNotePlaceholder: 'Lied-Wunsch, Allergie, Nachricht …',
  micRsvpSubmit: 'Rückmeldung senden',
  micRsvpUpdate: 'Rückmeldung aktualisieren',
  micRsvpConfirmation: 'Vielen Dank! Deine Rückmeldung ist angekommen.',
  micRsvpConfirmationMulti: 'Vielen Dank! Eure Rückmeldung ist angekommen.',

  // Closing
  micClosingBody: 'Wir freuen uns auf einen besonderen Tag mit Euch.',
  micClosingSign: 'Julia & Subhadip',

  // Hamburger menu
  micMenuOpenStd: 'Save-the-Date öffnen',

  // Toggles — default ON
  micEnableCurtain: 'true',
  micEnablePetals: 'true',

  // Placeholder
  micImagePlaceholder: 'Bild wird noch hochgeladen',

  // Invalid token
  micInvalidTokenBody:
    'Diese Einladung ist leider ungültig. Bitte wende dich an Julia oder Subhadip.',
}

// ── Image slots ───────────────────────────────────────────────────────────────

export const MIC_IMAGE_SLOTS = [
  'hero',
  'day22Bg',
  'day23Bg',
  'faqBg',
  'rsvpBg',
  'closingBg',
] as const
export type MicImageSlot = typeof MIC_IMAGE_SLOTS[number]

export const MIC_IMAGE_VARIANTS = ['default', 'desktop', 'tablet', 'mobile'] as const
export type MicImageVariant = typeof MIC_IMAGE_VARIANTS[number]

/** Only the hero slot uses breakpoint variants. All other slots use `default` only. */
export function isValidVariantForSlot(slot: string, variant: string): boolean {
  if (slot === 'hero') return (MIC_IMAGE_VARIANTS as readonly string[]).includes(variant)
  return variant === 'default'
}

export function isValidSlot(slot: string): slot is MicImageSlot {
  return (MIC_IMAGE_SLOTS as readonly string[]).includes(slot)
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Merge admin-set DB rows over built-in defaults. Returns a complete map. */
export function mergeMicContent(rows: { key: string; value: string }[]): Record<MicContentKey, string> {
  const result = { ...MIC_DEFAULTS }
  for (const row of rows) {
    if ((MIC_CONTENT_KEYS as readonly string[]).includes(row.key)) {
      result[row.key as MicContentKey] = row.value
    }
  }
  return result
}

/** Read a toggle as a boolean. Any non-'true' value counts as false. */
export function isToggleOn(content: Record<MicContentKey, string>, key: 'micEnableCurtain' | 'micEnablePetals'): boolean {
  return content[key] === 'true'
}

/** Baked default hero image path — always present in the repo. */
export const BAKED_HERO_PATH = '/photos/MIC/MIC_home.jpeg'
