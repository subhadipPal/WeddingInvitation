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
      'Wir heiraten am Freitag, 22. Januar 2027 & Samstag, 23. Januar 2027 in Berlin. Deshalb haltet Euch bitte diese Termine frei! Die Einladung & nähere Informationen folgen.',
    inviteBody23only:
      'Wir heiraten am Samstag, 23. Januar 2027 in Berlin. Deshalb haltet Euch bitte diesen Termin frei! Die Einladung & nähere Informationen folgen.',
    inviteDate22: 'Freitag, 22. Januar 2027',
    inviteDate23: 'Samstag, 23. Januar 2027',
    inviteClosing: 'Liebe Grüße — Julia & Ravi',
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
    adminTitle: 'Gästeverwaltung — Julia & Ravi',
    adminPassword: 'Passwort',
    adminLogin: 'Anmelden',
    adminGuestName: 'Name',
    adminEmail: 'E-Mail (optional)',
    adminPhone: 'Telefon/WhatsApp (optional)',
    adminDays: 'Eingeladen zu',
    adminDays22and23: '22. + 23. Januar',
    adminDays23only: '23. Januar',
    adminDefaultLang: 'Standardsprache',
    adminCreate: 'Gast hinzufügen & Link generieren',
    adminLinkDe: 'Deutsch-Link',
    adminLinkEn: 'English-Link',
    adminCopy: 'Kopieren',
    adminCopied: 'Kopiert!',
    adminExportCsv: 'Als CSV exportieren',
    adminTotal: 'Gesamt eingeladen',
    adminConfirmed: 'Zusagen',
    adminDeclined: 'Absagen',
    adminPending: 'Ausstehend',
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
      'We are getting married on Friday, 22nd January 2027 & Saturday, 23rd January 2027 in Berlin. Please save the dates! Full invitation and details to follow.',
    inviteBody23only:
      'We are getting married on Saturday, 23rd January 2027 in Berlin. Please save the date! Full invitation and details to follow.',
    inviteDate22: 'Friday, 22nd January 2027',
    inviteDate23: 'Saturday, 23rd January 2027',
    inviteClosing: 'With love — Julia & Ravi',
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

export function t(key: keyof Translations, lang: Lang): string {
  return translations[lang][key]
}
