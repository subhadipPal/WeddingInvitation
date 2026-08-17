import { db } from '@/lib/db'
import { content } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export type Lang = 'de' | 'en'

export interface Translations {
  coupleNames: string
  tapToOpen: string
  saveTheDate: string
  countdownDays: string
  countdownHours: string
  countdownMinutes: string
  countdownSeconds: string
  inviteHeading: string
  inviteBody22and23: string
  inviteBody23only: string
  inviteDate22: string
  inviteDate23: string
  inviteClosing: string
  calendarLabel: string
  noGuestClosingBody: string
  noGuestClosingSign: string
  rsvpGreeting: string
  rsvpInvited22and23: string
  rsvpInvited23only: string
  rsvpQuestion: string
  rsvpYes: string
  rsvpNo: string
  rsvpMaybe: string
  rsvpNote: string
  rsvpNotePlaceholder: string
  rsvpSubmit: string
  rsvpUpdate: string
  rsvpConfirmation: string
  // admin-internal labels (not editable via content editor)
  adminTitle: string
  adminPassword: string
  adminLogin: string
  adminGuestName: string
  adminEmail: string
  adminPhone: string
  adminDays: string
  adminDays22and23: string
  adminDays23only: string
  adminDefaultLang: string
  adminCreate: string
  adminLinkDe: string
  adminLinkEn: string
  adminCopy: string
  adminCopied: string
  adminExportCsv: string
  adminTotal: string
  adminConfirmed: string
  adminDeclined: string
  adminPending: string
}

export const GUEST_FACING_KEYS: (keyof Translations)[] = [
  'coupleNames', 'tapToOpen', 'saveTheDate',
  'countdownDays', 'countdownHours', 'countdownMinutes', 'countdownSeconds',
  'inviteHeading', 'inviteBody22and23', 'inviteBody23only',
  'inviteDate22', 'inviteDate23', 'inviteClosing',
  'calendarLabel', 'noGuestClosingBody', 'noGuestClosingSign',
  'rsvpGreeting', 'rsvpInvited22and23', 'rsvpInvited23only',
  'rsvpQuestion', 'rsvpYes', 'rsvpNo', 'rsvpMaybe',
  'rsvpNote', 'rsvpNotePlaceholder', 'rsvpSubmit', 'rsvpUpdate', 'rsvpConfirmation',
]

export const translations: Record<Lang, Translations> = {
  de: {
    coupleNames: 'Julia Schulze & Subhadip Pal',
    tapToOpen: 'Tippe hier zum Öffnen',
    saveTheDate: 'Save the Date',
    countdownDays: 'Tage',
    countdownHours: 'Stunden',
    countdownMinutes: 'Minuten',
    countdownSeconds: 'Sekunden',
    inviteHeading: 'Wir sagen Ja!',
    inviteBody22and23:
      'Wir heiraten am Freitag, 22. Januar 2027 in Berlin. Am Samstag, 23. Januar 2027 feiern wir gemeinsam weiter. Haltet Euch bitte diese Termine frei! Die Einladung & nähere Informationen folgen.',
    inviteBody23only:
      'Wir feiern am Samstag, 23. Januar 2027 in Berlin. Haltet Euch bitte diesen Termin frei! Die Einladung & nähere Informationen folgen.',
    inviteDate22: 'Hochzeit — Freitag, 22. Januar 2027',
    inviteDate23: 'Feier — Samstag, 23. Januar 2027',
    inviteClosing: 'Liebe Grüße — Julia & Ravi',
    calendarLabel: 'Haltet den Termin frei',
    noGuestClosingBody: 'Die Einladung & nähere Informationen folgen.',
    noGuestClosingSign: 'Liebe Grüße',
    rsvpGreeting: 'Liebe/r',
    rsvpInvited22and23: 'Du bist herzlich eingeladen zur Hochzeit am 22. & 23. Januar 2027.',
    rsvpInvited23only: 'Du bist herzlich eingeladen zur Hochzeit am 23. Januar 2027.',
    rsvpQuestion: 'Wirst du dabei sein?',
    rsvpYes: 'Ich komme!',
    rsvpNo: 'Leider nicht möglich',
    rsvpMaybe: 'Vielleicht',
    rsvpNote: 'Nachricht an das Brautpaar (optional)',
    rsvpNotePlaceholder: 'Herzliche Glückwünsche und...',
    rsvpSubmit: 'Antwort senden',
    rsvpUpdate: 'Antwort aktualisieren',
    rsvpConfirmation: 'Vielen Dank! Wir freuen uns auf dich.',
    adminTitle: 'Guest Management — Julia & Ravi',
    adminPassword: 'Password',
    adminLogin: 'Login',
    adminGuestName: 'Name',
    adminEmail: 'Email (optional)',
    adminPhone: 'Phone/WhatsApp (optional)',
    adminDays: 'Invited to',
    adminDays22and23: '22nd + 23rd January',
    adminDays23only: '23rd January only',
    adminDefaultLang: 'Default language',
    adminCreate: 'Add guest & generate links',
    adminLinkDe: 'German link',
    adminLinkEn: 'English link',
    adminCopy: 'Copy',
    adminCopied: 'Copied!',
    adminExportCsv: 'Export as CSV',
    adminTotal: 'Total invited',
    adminConfirmed: 'Confirmed',
    adminDeclined: 'Declined',
    adminPending: 'Pending',
  },
  en: {
    coupleNames: 'Julia Schulze & Subhadip Pal',
    tapToOpen: 'Tap here to open',
    saveTheDate: 'Save the Date',
    countdownDays: 'Days',
    countdownHours: 'Hours',
    countdownMinutes: 'Minutes',
    countdownSeconds: 'Seconds',
    inviteHeading: "We're saying yes!",
    inviteBody22and23:
      'We are getting married on Friday, 22nd January 2027 in Berlin. On Saturday, 23rd January 2027 we continue the celebrations. Please save both dates! Full invitation and details to follow.',
    inviteBody23only:
      'We are celebrating on Saturday, 23rd January 2027 in Berlin. Please save the date! Full invitation and details to follow.',
    inviteDate22: 'Wedding — Friday, 22nd January 2027',
    inviteDate23: 'Celebration — Saturday, 23rd January 2027',
    inviteClosing: 'With love — Julia & Ravi',
    calendarLabel: 'Mark your calendar',
    noGuestClosingBody: 'Full invitation and details to follow.',
    noGuestClosingSign: 'With love',
    rsvpGreeting: 'Dear',
    rsvpInvited22and23: 'You are cordially invited to our Hochzeit on 22nd & 23rd January 2027.',
    rsvpInvited23only: 'You are cordially invited to our Hochzeit on 23rd January 2027.',
    rsvpQuestion: 'Will you be joining us?',
    rsvpYes: "I'll be there!",
    rsvpNo: "Unfortunately can't make it",
    rsvpMaybe: 'Maybe',
    rsvpNote: 'Message to the couple (optional)',
    rsvpNotePlaceholder: 'Congratulations and...',
    rsvpSubmit: 'Send RSVP',
    rsvpUpdate: 'Update RSVP',
    rsvpConfirmation: 'Thank you! We look forward to seeing you.',
    adminTitle: 'Guest Management — Julia & Ravi',
    adminPassword: 'Password',
    adminLogin: 'Login',
    adminGuestName: 'Name',
    adminEmail: 'Email (optional)',
    adminPhone: 'Phone/WhatsApp (optional)',
    adminDays: 'Invited to',
    adminDays22and23: '22nd + 23rd January',
    adminDays23only: '23rd January only',
    adminDefaultLang: 'Default language',
    adminCreate: 'Add guest & generate links',
    adminLinkDe: 'German link',
    adminLinkEn: 'English link',
    adminCopy: 'Copy',
    adminCopied: 'Copied!',
    adminExportCsv: 'Export as CSV',
    adminTotal: 'Total invited',
    adminConfirmed: 'Confirmed',
    adminDeclined: 'Declined',
    adminPending: 'Pending',
  },
}

export function t(key: keyof Translations, lang: Lang, overrides?: Partial<Translations>): string {
  return (overrides?.[key] as string | undefined) ?? translations[lang][key]
}

export async function loadTranslations(lang: Lang): Promise<Translations> {
  try {
    const rows = await db.select().from(content).where(eq(content.lang, lang))
    if (!rows.length) return translations[lang]
    const overrides: Partial<Translations> = {}
    for (const row of rows) {
      const key = row.key as keyof Translations
      if (key in translations[lang]) {
        overrides[key] = row.value
      }
    }
    return { ...translations[lang], ...overrides }
  } catch {
    return translations[lang]
  }
}
