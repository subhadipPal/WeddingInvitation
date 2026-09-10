export type Lang = 'de' | 'en' | 'bn'

export interface Translations {
  coupleNames: string
  tapToOpen: string
  saveTheDate: string
  ogTitle: string
  ogSubtitle: string
  ogDate: string
  ogLocation: string
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
  rsvpAddressLabel: string
  rsvpAddressPlaceholder: string
  rsvpAddressRequired: string
  rsvpNote: string
  rsvpNotePlaceholder: string
  rsvpSubmit: string
  rsvpUpdate: string
  rsvpConfirmation: string
  rsvpConfirmationMulti: string
  // ── Hindu Wedding (India, 28 Jan) — EN + BN shown; DE mirrors EN (never displayed) ──
  hindu_ogTitle: string
  hindu_ogSubtitle: string
  hindu_ogDate: string
  hindu_ogLocation: string
  hindu_saveTheDate: string
  hindu_tapToOpen: string
  hindu_inviteHeading: string
  hindu_inviteBody: string
  hindu_inviteBodyMulti: string
  hindu_inviteDate: string
  hindu_inviteClosing: string
  hindu_calendarLabel: string
  hindu_venueName: string
  hindu_venueAddress: string
  hindu_venueDirections: string
  hindu_rsvpGreeting: string
  hindu_rsvpGreetingMulti: string
  hindu_rsvpQuestion: string
  hindu_rsvpQuestionMulti: string
  hindu_rsvpYes: string
  hindu_rsvpYesMulti: string
  hindu_rsvpNo: string
  hindu_rsvpNote: string
  hindu_rsvpNotePlaceholder: string
  hindu_rsvpSubmit: string
  hindu_rsvpUpdate: string
  hindu_rsvpConfirmation: string
  hindu_rsvpConfirmationMulti: string
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
  'ogTitle', 'ogSubtitle', 'ogDate', 'ogLocation',
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
  'rsvpAddressLabel', 'rsvpAddressPlaceholder', 'rsvpAddressRequired',
  'rsvpNote', 'rsvpNotePlaceholder', 'rsvpSubmit', 'rsvpUpdate',
  'rsvpConfirmation', 'rsvpConfirmationMulti',
]

export const HINDU_GUEST_FACING_KEYS: (keyof Translations)[] = [
  'hindu_ogTitle', 'hindu_ogSubtitle', 'hindu_ogDate', 'hindu_ogLocation',
  'hindu_saveTheDate', 'hindu_tapToOpen',
  'hindu_inviteHeading', 'hindu_inviteBody', 'hindu_inviteBodyMulti',
  'hindu_inviteDate', 'hindu_inviteClosing', 'hindu_calendarLabel',
  'hindu_venueName', 'hindu_venueAddress', 'hindu_venueDirections',
  'hindu_rsvpGreeting', 'hindu_rsvpGreetingMulti',
  'hindu_rsvpQuestion', 'hindu_rsvpQuestionMulti',
  'hindu_rsvpYes', 'hindu_rsvpYesMulti', 'hindu_rsvpNo',
  'hindu_rsvpNote', 'hindu_rsvpNotePlaceholder',
  'hindu_rsvpSubmit', 'hindu_rsvpUpdate',
  'hindu_rsvpConfirmation', 'hindu_rsvpConfirmationMulti',
]

export const translations: Record<Lang, Translations> = {
  de: {
    coupleNames: 'Julia Schulze & Subhadip Pal',
    tapToOpen: 'Tippe hier zum Öffnen',
    saveTheDate: 'Save the Date',
    ogTitle: 'Julia & Subhadip',
    ogSubtitle: 'Save the Date',
    ogDate: '22 & 23 January 2027',
    ogLocation: 'Berlin',
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
    rsvpAddressLabel: 'Deine Postanschrift',
    rsvpAddressPlaceholder: 'Straße, Hausnummer\nPLZ Ort\nLand',
    rsvpAddressRequired: 'Wir möchten dir die Einladung gerne persönlich zusenden — bitte hinterlasse uns deine Adresse. 💌',
    rsvpSubmit: 'Antwort senden',
    rsvpUpdate: 'Antwort aktualisieren',
    rsvpConfirmation: 'Vielen Dank! Wir freuen uns auf dich.',
    rsvpConfirmationMulti: 'Vielen Dank! Wir freuen uns auf euch.',
    // Hindu Wedding — DE mirrors EN (never displayed to Berlin guests)
    hindu_ogTitle: 'Julia & Subhadip',
    hindu_ogSubtitle: 'Hindu Wedding',
    hindu_ogDate: '28 January 2027',
    hindu_ogLocation: 'Kolkata, India',
    hindu_saveTheDate: 'Save the Date',
    hindu_tapToOpen: 'Tap here to open',
    hindu_inviteHeading: "We're getting married!",
    hindu_inviteBody:
      'We joyfully invite you to our Hindu wedding ceremony. Having registered our marriage in Berlin on 22nd January 2027, we now celebrate our union in the sacred traditions at Sri Sri Karunamoyee Kali Temple, Kolkata. Your presence and blessings would mean the world to us.',
    hindu_inviteBodyMulti:
      'We joyfully invite you to our Hindu wedding ceremony. Having registered our marriage in Berlin on 22nd January 2027, we now celebrate our union in the sacred traditions at Sri Sri Karunamoyee Kali Temple, Kolkata. Your presence and blessings would mean the world to us.',
    hindu_inviteDate: '28th January 2027 — 5:30 PM',
    hindu_inviteClosing: 'With love — Julia & Subhadip',
    hindu_calendarLabel: 'Mark your calendar',
    hindu_venueName: 'Sri Sri Karunamoyee Kali Temple',
    hindu_venueAddress: 'Kolkata, West Bengal, India',
    hindu_venueDirections: 'Get Directions',
    hindu_rsvpGreeting: 'Dear',
    hindu_rsvpGreetingMulti: 'Dear',
    hindu_rsvpQuestion: 'Will you be joining us?',
    hindu_rsvpQuestionMulti: 'Will you be joining us?',
    hindu_rsvpYes: "I'll be there!",
    hindu_rsvpYesMulti: "We'll be there!",
    hindu_rsvpNo: "Unfortunately can't make it",
    hindu_rsvpNote: 'Message to the couple (optional)',
    hindu_rsvpNotePlaceholder: 'Congratulations and...',
    hindu_rsvpSubmit: 'Send RSVP',
    hindu_rsvpUpdate: 'Update RSVP',
    hindu_rsvpConfirmation: 'Thank you! We look forward to seeing you.',
    hindu_rsvpConfirmationMulti: 'Thank you! We look forward to seeing you.',
    adminTitle: 'Guest Management — Julia & Subhadip',
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
    ogTitle: 'Julia & Subhadip',
    ogSubtitle: 'Save the Date',
    ogDate: '22 & 23 January 2027',
    ogLocation: 'Berlin',
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
    rsvpAddressLabel: 'Your postal address',
    rsvpAddressPlaceholder: 'Street, house number\nPostcode City\nCountry',
    rsvpAddressRequired: "We'd love to send you the formal invitation — please share your address with us. 💌",
    rsvpSubmit: 'Send RSVP',
    rsvpUpdate: 'Update RSVP',
    rsvpConfirmation: 'Thank you! We look forward to seeing you.',
    rsvpConfirmationMulti: 'Thank you! We look forward to seeing you.',
    // Hindu Wedding — India (28 Jan)
    hindu_ogTitle: 'Julia & Subhadip',
    hindu_ogSubtitle: 'Hindu Wedding',
    hindu_ogDate: '28 January 2027',
    hindu_ogLocation: 'Kolkata, India',
    hindu_saveTheDate: 'Save the Date',
    hindu_tapToOpen: 'Tap here to open',
    hindu_inviteHeading: "We're getting married!",
    hindu_inviteBody:
      'We joyfully invite you to our Hindu wedding ceremony. Having registered our marriage in Berlin on 22nd January 2027, we now celebrate our union in the sacred traditions at Sri Sri Karunamoyee Kali Temple, Kolkata. Your presence and blessings would mean the world to us.',
    hindu_inviteBodyMulti:
      'We joyfully invite you to our Hindu wedding ceremony. Having registered our marriage in Berlin on 22nd January 2027, we now celebrate our union in the sacred traditions at Sri Sri Karunamoyee Kali Temple, Kolkata. Your presence and blessings would mean the world to us.',
    hindu_inviteDate: '28th January 2027 — 5:30 PM',
    hindu_inviteClosing: 'With love — Julia & Subhadip',
    hindu_calendarLabel: 'Mark your calendar',
    hindu_venueName: 'Sri Sri Karunamoyee Kali Temple',
    hindu_venueAddress: 'Kolkata, West Bengal, India',
    hindu_venueDirections: 'Get Directions',
    hindu_rsvpGreeting: 'Dear',
    hindu_rsvpGreetingMulti: 'Dear',
    hindu_rsvpQuestion: 'Will you be joining us?',
    hindu_rsvpQuestionMulti: 'Will you be joining us?',
    hindu_rsvpYes: "I'll be there!",
    hindu_rsvpYesMulti: "We'll be there!",
    hindu_rsvpNo: "Unfortunately can't make it",
    hindu_rsvpNote: 'Message to the couple (optional)',
    hindu_rsvpNotePlaceholder: 'Congratulations and...',
    hindu_rsvpSubmit: 'Send RSVP',
    hindu_rsvpUpdate: 'Update RSVP',
    hindu_rsvpConfirmation: 'Thank you! We look forward to seeing you.',
    hindu_rsvpConfirmationMulti: 'Thank you! We look forward to seeing you.',
    adminTitle: 'Guest Management — Julia & Subhadip',
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
  bn: {
    // Berlin/admin keys mirror EN — never shown to Bengali (India) guests, but required by the type
    coupleNames: 'Julia Schulze & Subhadip Pal',
    tapToOpen: 'Tap here to open',
    saveTheDate: 'Save the Date',
    ogTitle: 'Julia & Subhadip',
    ogSubtitle: 'Save the Date',
    ogDate: '28 January 2027',
    ogLocation: 'Kolkata',
    countdownDays: 'দিন',
    countdownHours: 'ঘণ্টা',
    countdownMinutes: 'মিনিট',
    countdownSeconds: 'সেকেন্ড',
    inviteHeading: "We're saying yes!",
    inviteBody22and23: '',
    inviteBody23only: '',
    inviteBody22and23Multi: '',
    inviteBody23onlyMulti: '',
    section2Body22and23: '',
    section2Body23only: '',
    section2Body22and23Multi: '',
    section2Body23onlyMulti: '',
    inviteDate22: '',
    inviteDate23: '',
    inviteClosing: 'With love — Julia & Subhadip',
    calendarLabel: 'Mark your calendar',
    noGuestClosingBody: '',
    noGuestClosingSign: 'With love',
    rsvpGreeting: 'Dear',
    rsvpGreetingMulti: 'Dear',
    rsvpInvited22and23: '',
    rsvpInvited22and23Multi: '',
    rsvpInvited23only: '',
    rsvpInvited23onlyMulti: '',
    rsvpQuestion: 'Will you be joining us?',
    rsvpQuestionMulti: 'Will you be joining us?',
    rsvpYes: "I'll be there!",
    rsvpYesMulti: "We'll be there!",
    rsvpNo: "Unfortunately can't make it",
    rsvpMaybe: 'Maybe',
    rsvpNote: 'Message to the couple (optional)',
    rsvpNotePlaceholder: 'Congratulations and...',
    rsvpAddressLabel: 'Your postal address',
    rsvpAddressPlaceholder: '',
    rsvpAddressRequired: '',
    rsvpSubmit: 'Send RSVP',
    rsvpUpdate: 'Update RSVP',
    rsvpConfirmation: 'Thank you! We look forward to seeing you.',
    rsvpConfirmationMulti: 'Thank you! We look forward to seeing you.',
    // ── Hindu Wedding — Bengali ──
    hindu_ogTitle: 'Julia & Subhadip',
    hindu_ogSubtitle: 'Hindu Wedding',
    hindu_ogDate: '28 January 2027',
    hindu_ogLocation: 'Kolkata, India',
    hindu_saveTheDate: 'তারিখটি মনে রাখবেন',
    hindu_tapToOpen: 'খুলতে এখানে চাপ দিন',
    hindu_inviteHeading: 'আমরা বিবাহবন্ধনে আবদ্ধ হচ্ছি!',
    hindu_inviteBody:
      'আমাদের হিন্দু বিবাহ অনুষ্ঠানে আপনাকে সাদরে আমন্ত্রণ জানাই। ২২শে জানুয়ারি ২০২৭ বার্লিনে আইনি বিবাহ সম্পন্ন করে, আমরা এখন কলকাতার শ্রী শ্রী করুণাময়ী কালী মন্দিরে পবিত্র রীতি অনুযায়ী আমাদের মিলন উদযাপন করছি। আপনার উপস্থিতি ও আশীর্বাদ আমাদের কাছে অত্যন্ত মূল্যবান।',
    hindu_inviteBodyMulti:
      'আমাদের হিন্দু বিবাহ অনুষ্ঠানে আপনাদের সাদরে আমন্ত্রণ জানাই। ২২শে জানুয়ারি ২০২৭ বার্লিনে আইনি বিবাহ সম্পন্ন করে, আমরা এখন কলকাতার শ্রী শ্রী করুণাময়ী কালী মন্দিরে পবিত্র রীতি অনুযায়ী আমাদের মিলন উদযাপন করছি। আপনাদের উপস্থিতি ও আশীর্বাদ আমাদের কাছে অত্যন্ত মূল্যবান।',
    hindu_inviteDate: '২৮শে জানুয়ারি ২০২৭ — সন্ধ্যা ৫:৩০',
    hindu_inviteClosing: 'ভালোবাসা সহ — Julia ও Subhadip',
    hindu_calendarLabel: 'তারিখটি মনে রাখবেন',
    hindu_venueName: 'শ্রী শ্রী করুণাময়ী কালী মন্দির',
    hindu_venueAddress: 'কলকাতা, পশ্চিমবঙ্গ, ভারত',
    hindu_venueDirections: 'পথনির্দেশ দেখুন',
    hindu_rsvpGreeting: 'প্রিয়',
    hindu_rsvpGreetingMulti: 'প্রিয়',
    hindu_rsvpQuestion: 'আপনি কি আমাদের সঙ্গে থাকবেন?',
    hindu_rsvpQuestionMulti: 'আপনারা কি আমাদের সঙ্গে থাকবেন?',
    hindu_rsvpYes: 'আমি আসব!',
    hindu_rsvpYesMulti: 'আমরা আসব!',
    hindu_rsvpNo: 'দুঃখিত, আসতে পারব না',
    hindu_rsvpNote: 'দম্পতির জন্য বার্তা (ঐচ্ছিক)',
    hindu_rsvpNotePlaceholder: 'শুভেচ্ছা এবং...',
    hindu_rsvpSubmit: 'উত্তর পাঠান',
    hindu_rsvpUpdate: 'উত্তর আপডেট করুন',
    hindu_rsvpConfirmation: 'ধন্যবাদ! আপনার সঙ্গে দেখা হওয়ার অপেক্ষায় রইলাম।',
    hindu_rsvpConfirmationMulti: 'ধন্যবাদ! আপনাদের সঙ্গে দেখা হওয়ার অপেক্ষায় রইলাম।',
    adminTitle: 'Guest Management — Julia & Subhadip',
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
