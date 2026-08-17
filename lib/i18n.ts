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
  section2Body22and23: string
  section2Body23only: string
  inviteBody22and23Multi: string
  inviteBody23onlyMulti: string
  section2Body22and23Multi: string
  section2Body23onlyMulti: string
  inviteDate22: string
  inviteDate23: string
  inviteClosing: string
  calendarLabel: string
  noGuestClosingBody: string
  noGuestClosingSign: string
  rsvpGreeting: string
  rsvpGreetingMulti: string
  rsvpInvited22and23: string
  rsvpInvited22and23Multi: string
  rsvpInvited23only: string
  rsvpInvited23onlyMulti: string
  rsvpQuestion: string
  rsvpQuestionMulti: string
  rsvpYes: string
  rsvpYesMulti: string
  rsvpNo: string
  rsvpMaybe: string
  rsvpNote: string
  rsvpNotePlaceholder: string
  rsvpSubmit: string
  rsvpUpdate: string
  rsvpConfirmation: string
  rsvpConfirmationMulti: string
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
  'inviteBody22and23Multi', 'inviteBody23onlyMulti',
  'section2Body22and23', 'section2Body23only',
  'section2Body22and23Multi', 'section2Body23onlyMulti',
  'inviteDate22', 'inviteDate23', 'inviteClosing',
  'calendarLabel', 'noGuestClosingBody', 'noGuestClosingSign',
  'rsvpGreeting', 'rsvpGreetingMulti',
  'rsvpInvited22and23', 'rsvpInvited22and23Multi',
  'rsvpInvited23only', 'rsvpInvited23onlyMulti',
  'rsvpQuestion', 'rsvpQuestionMulti',
  'rsvpYes', 'rsvpYesMulti', 'rsvpNo', 'rsvpMaybe',
  'rsvpNote', 'rsvpNotePlaceholder', 'rsvpSubmit', 'rsvpUpdate',
  'rsvpConfirmation', 'rsvpConfirmationMulti',
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
    inviteBody22and23Multi:
      'Wir heiraten am Freitag, 22. Januar 2027 in Berlin. Am Samstag, 23. Januar 2027 feiern wir gemeinsam weiter. Haltet Euch bitte diese Termine frei! Die Einladung & nähere Informationen folgen.',
    inviteBody23onlyMulti:
      'Wir feiern am Samstag, 23. Januar 2027 in Berlin. Haltet Euch bitte diesen Termin frei! Die Einladung & nähere Informationen folgen.',
    section2Body22and23:
      'Wir möchten diesen besonderen Tag mit Euch teilen! Wir heiraten am 22. Januar 2027 und feiern am 23. Januar 2027 gemeinsam weiter.',
    section2Body23only:
      'Wir möchten diesen besonderen Tag mit Euch feiern! Kommt am 23. Januar 2027 zu unserer Hochzeitsfeier nach Berlin.',
    section2Body22and23Multi:
      'Wir möchten diesen besonderen Tag mit Euch teilen! Wir heiraten am 22. Januar 2027 und feiern am 23. Januar 2027 gemeinsam weiter.',
    section2Body23onlyMulti:
      'Wir möchten diesen besonderen Tag mit Euch feiern! Kommt am 23. Januar 2027 zu unserer Hochzeitsfeier nach Berlin.',
    inviteDate22: 'Hochzeit — Freitag, 22. Januar 2027',
    inviteDate23: 'Feier — Samstag, 23. Januar 2027',
    inviteClosing: 'Liebe Grüße — Julia & Ravi',
    calendarLabel: 'Haltet den Termin frei',
    noGuestClosingBody: 'Die Einladung & nähere Informationen folgen.',
    noGuestClosingSign: 'Liebe Grüße',
    rsvpGreeting: 'Liebe/r',
    rsvpGreetingMulti: 'Liebe',
    rsvpInvited22and23: 'Du bist herzlich eingeladen zur Hochzeit am 22. & 23. Januar 2027.',
    rsvpInvited22and23Multi: 'Ihr seid herzlich eingeladen zur Hochzeit am 22. & 23. Januar 2027.',
    rsvpInvited23only: 'Du bist herzlich eingeladen zur Hochzeit am 23. Januar 2027.',
    rsvpInvited23onlyMulti: 'Ihr seid herzlich eingeladen zur Hochzeit am 23. Januar 2027.',
    rsvpQuestion: 'Wirst du dabei sein?',
    rsvpQuestionMulti: 'Werdet ihr dabei sein?',
    rsvpYes: 'Ich komme!',
    rsvpYesMulti: 'Wir kommen!',
    rsvpNo: 'Leider nicht möglich',
    rsvpMaybe: 'Vielleicht',
    rsvpNote: 'Nachricht an das Brautpaar (optional)',
    rsvpNotePlaceholder: 'Herzliche Glückwünsche und...',
    rsvpSubmit: 'Antwort senden',
    rsvpUpdate: 'Antwort aktualisieren',
    rsvpConfirmation: 'Vielen Dank! Wir freuen uns auf dich.',
    rsvpConfirmationMulti: 'Vielen Dank! Wir freuen uns auf euch.',
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
    inviteBody22and23Multi:
      'We are getting married on Friday, 22nd January 2027 in Berlin. On Saturday, 23rd January 2027 we continue the celebrations. Please save both dates! Full invitation and details to follow.',
    inviteBody23onlyMulti:
      'We are celebrating on Saturday, 23rd January 2027 in Berlin. Please save the date! Full invitation and details to follow.',
    section2Body22and23:
      'We would love to share this special day with you! We are getting married on 22nd January 2027 and celebrating together on 23rd January 2027.',
    section2Body23only:
      'We would love to celebrate this special day with you! Join us on 23rd January 2027 for our wedding celebration in Berlin.',
    section2Body22and23Multi:
      'We would love to share this special day with you! We are getting married on 22nd January 2027 and celebrating together on 23rd January 2027.',
    section2Body23onlyMulti:
      'We would love to celebrate this special day with you! Join us on 23rd January 2027 for our wedding celebration in Berlin.',
    inviteDate22: 'Wedding — Friday, 22nd January 2027',
    inviteDate23: 'Celebration — Saturday, 23rd January 2027',
    inviteClosing: 'With love — Julia & Ravi',
    calendarLabel: 'Mark your calendar',
    noGuestClosingBody: 'Full invitation and details to follow.',
    noGuestClosingSign: 'With love',
    rsvpGreeting: 'Dear',
    rsvpGreetingMulti: 'Dear',
    rsvpInvited22and23: 'You are cordially invited to our Hochzeit on 22nd & 23rd January 2027.',
    rsvpInvited22and23Multi: 'You are cordially invited to our Hochzeit on 22nd & 23rd January 2027.',
    rsvpInvited23only: 'You are cordially invited to our Hochzeit on 23rd January 2027.',
    rsvpInvited23onlyMulti: 'You are cordially invited to our Hochzeit on 23rd January 2027.',
    rsvpQuestion: 'Will you be joining us?',
    rsvpQuestionMulti: 'Will you be joining us?',
    rsvpYes: "I'll be there!",
    rsvpYesMulti: "I'll be there!",
    rsvpNo: "Unfortunately can't make it",
    rsvpMaybe: 'Maybe',
    rsvpNote: 'Message to the couple (optional)',
    rsvpNotePlaceholder: 'Congratulations and...',
    rsvpSubmit: 'Send RSVP',
    rsvpUpdate: 'Update RSVP',
    rsvpConfirmation: 'Thank you! We look forward to seeing you.',
    rsvpConfirmationMulti: 'Thank you! We look forward to seeing you.',
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
