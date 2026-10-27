'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { translations as defaults, GUEST_FACING_KEYS, HINDU_GUEST_FACING_KEYS, type Translations } from '@/lib/i18n'
import { triggerRedeploy } from './actions'
import { MIC_DEFAULTS, MIC_IMAGE_SLOTS, type MicContentKey, type MicImageSlot } from '@/lib/mic'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Rsvp {
  attending22: boolean | null
  attending23: boolean | null
  attending28: boolean | null
  address: string | null
  note: string | null
}

interface MicRsvp {
  attending22: boolean | null
  attending23: boolean | null
  address: string | null
  note: string | null
}

interface Guest {
  id: string
  token: string
  name: string
  email: string | null
  phone: string | null
  invitedDays: string
  isMulti: boolean
  isBengali: boolean
  micToken: string | null
  createdAt: string
  rsvp: Rsvp | null
  micRsvp: MicRsvp | null
}

type Tab = 'guests' | 'content' | 'mic'
type ContentState = { de: Record<string, string>; en: Record<string, string>; bn: Record<string, string> }

// ── Content key groups for the editor UI ───────────────────────────────────────

const CONTENT_GROUPS: { label: string; keys: (keyof Translations)[]; deOnly?: boolean; enBn?: boolean }[] = [
  {
    label: 'General',
    keys: ['coupleNames', 'saveTheDate', 'tapToOpen'],
  },
  {
    label: 'Social share preview (WhatsApp / OG)',
    keys: ['ogTitle', 'ogSubtitle', 'ogDate', 'ogLocation'],
  },
  {
    label: 'Countdown labels',
    keys: ['countdownDays', 'countdownHours', 'countdownMinutes', 'countdownSeconds'],
  },
  {
    label: 'Invitation',
    keys: ['inviteHeading', 'inviteBody22and23', 'inviteBody23only', 'section2Body22and23', 'section2Body23only', 'inviteDate22', 'inviteDate23', 'inviteClosing', 'calendarLabel'],
  },
  {
    label: 'No-guest closing (shown when link has no token)',
    keys: ['noGuestClosingBody', 'noGuestClosingSign'],
  },
  {
    label: 'RSVP',
    keys: ['rsvpGreeting', 'rsvpInvited22and23', 'rsvpInvited23only', 'rsvpQuestion', 'rsvpYes', 'rsvpNo', 'rsvpMaybe', 'rsvpNote', 'rsvpNotePlaceholder', 'rsvpSubmit', 'rsvpUpdate', 'rsvpConfirmation'],
  },
  {
    label: 'Multi-person invite — DE only (Ihr/Euch forms)',
    keys: ['inviteBody22and23Multi', 'inviteBody23onlyMulti', 'section2Body22and23Multi', 'section2Body23onlyMulti', 'rsvpGreetingMulti', 'rsvpInvited22and23Multi', 'rsvpInvited23onlyMulti', 'rsvpQuestionMulti', 'rsvpYesMulti', 'rsvpConfirmationMulti'],
    deOnly: true,
  },
  {
    label: 'Hindu Wedding — India (28 Jan) · English + Bengali',
    keys: HINDU_GUEST_FACING_KEYS,
    enBn: true,
  },
]

// ── MIC key groups for the editor UI ──────────────────────────────────────────

interface MicGroup {
  label: string
  keys: MicContentKey[]
  timetable?: boolean // textarea keys that use the multiline timetable format
  toggles?: boolean   // boolean toggle keys (stored as 'true'/'false')
}

const MIC_GROUPS: MicGroup[] = [
  {
    label: 'Hero',
    keys: ['micHeroDate', 'micImagePlaceholder', 'micMenuOpenStd', 'micInvalidTokenBody'],
  },
  {
    label: '22 Januar — Zeremonie',
    keys: ['mic22Eyebrow', 'mic22DateLine', 'mic22Body', 'mic22BodyMulti',
           'mic22TimetableHeading', 'mic22Timetable',
           'mic22VenueVillaName', 'mic22VenueVillaAddress',
           'mic22VenueHofName', 'mic22VenueHofAddress', 'mic22RouteButton'],
    timetable: true,
  },
  {
    label: '23 Januar — Feier',
    keys: ['mic23Eyebrow', 'mic23DateLine', 'mic23Tagline', 'mic23Body', 'mic23BodyMulti',
           'mic23TimetableHeading', 'mic23Timetable',
           'mic23VenueName', 'mic23VenueAddress'],
    timetable: true,
  },
  {
    label: 'FAQ — Häufige Fragen',
    keys: ['micFaqHeading',
           'micFaqDressCodeTitle', 'micFaqDressCodeBody',
           'micFaqGiftsTitle', 'micFaqGiftsBody',
           'micFaqChildrenTitle', 'micFaqChildrenBody',
           'micFaqRsvpDeadlineTitle', 'micFaqRsvpDeadlineBody',
           'micFaqPhotosTitle', 'micFaqPhotosBody'],
  },
  {
    label: 'RSVP-Formular',
    keys: ['micRsvpHeading', 'micRsvpGreeting', 'micRsvpGreetingMulti',
           'micRsvpQuestion22', 'micRsvpQuestion23',
           'micRsvpYes', 'micRsvpNo',
           'micRsvpAddressLabel', 'micRsvpAddressPlaceholder',
           'micRsvpNoteLabel', 'micRsvpNotePlaceholder',
           'micRsvpSubmit', 'micRsvpUpdate',
           'micRsvpConfirmation', 'micRsvpConfirmationMulti'],
  },
  {
    label: 'Abschluss',
    keys: ['micClosingBody', 'micClosingSign'],
  },
  {
    label: 'Animationen',
    keys: ['micEnableCurtain', 'micEnablePetals'],
    toggles: true,
  },
]

const MIC_KEY_LABELS: Partial<Record<MicContentKey, string>> = {
  micHeroDate: 'Datum im Hero (z.B. "22. und 23. Januar 2027")',
  micImagePlaceholder: 'Platzhaltertext wenn kein Bild hochgeladen',
  micMenuOpenStd: 'Hamburger-Menü — "Save-the-Date öffnen"',
  micInvalidTokenBody: 'Text bei ungültigem Token',
  mic22Eyebrow: '22 Jan — Wochentag-Label (oben)',
  mic22DateLine: '22 Jan — Datum',
  mic22Body: '22 Jan — Einladungstext (Du-Form)',
  mic22BodyMulti: '22 Jan — Einladungstext (Ihr-Form)',
  mic22TimetableHeading: '22 Jan — Ablauf-Überschrift',
  mic22Timetable: '22 Jan — Ablauf (je Zeile: "HH:MM Uhr   Beschreibung")',
  mic22VenueVillaName: '22 Jan — Hochzeitsvilla Name',
  mic22VenueVillaAddress: '22 Jan — Hochzeitsvilla Adresse',
  mic22VenueHofName: '22 Jan — Zehlendorfer Hof Name',
  mic22VenueHofAddress: '22 Jan — Zehlendorfer Hof Adresse',
  mic22RouteButton: 'Route-Button Beschriftung',
  mic23Eyebrow: '23 Jan — Wochentag-Label (oben)',
  mic23DateLine: '23 Jan — Datum',
  mic23Tagline: '23 Jan — Tagline',
  mic23Body: '23 Jan — Einladungstext (Du-Form)',
  mic23BodyMulti: '23 Jan — Einladungstext (Ihr-Form)',
  mic23TimetableHeading: '23 Jan — Ablauf-Überschrift',
  mic23Timetable: '23 Jan — Ablauf (je Zeile: "HH:MM Uhr   Beschreibung")',
  mic23VenueName: '23 Jan — Venue Name',
  mic23VenueAddress: '23 Jan — Venue Adresse',
  micFaqHeading: 'FAQ — Hauptüberschrift',
  micFaqDressCodeTitle: 'FAQ — Dresscode Titel',
  micFaqDressCodeBody: 'FAQ — Dresscode Text',
  micFaqGiftsTitle: 'FAQ — Geschenke Titel',
  micFaqGiftsBody: 'FAQ — Geschenke Text',
  micFaqChildrenTitle: 'FAQ — Kinder Titel',
  micFaqChildrenBody: 'FAQ — Kinder Text',
  micFaqRsvpDeadlineTitle: 'FAQ — RSVP-Frist Titel',
  micFaqRsvpDeadlineBody: 'FAQ — RSVP-Frist Text',
  micFaqPhotosTitle: 'FAQ — Fotos Titel',
  micFaqPhotosBody: 'FAQ — Fotos Text',
  micRsvpHeading: 'RSVP — Überschrift',
  micRsvpGreeting: 'RSVP — Begrüßung (Du-Form)',
  micRsvpGreetingMulti: 'RSVP — Begrüßung (Ihr-Form)',
  micRsvpQuestion22: 'RSVP — Frage 22. Jan',
  micRsvpQuestion23: 'RSVP — Frage 23. Jan',
  micRsvpYes: 'RSVP — Ja-Button',
  micRsvpNo: 'RSVP — Nein-Button',
  micRsvpAddressLabel: 'RSVP — Adressfeld Label',
  micRsvpAddressPlaceholder: 'RSVP — Adressfeld Platzhalter',
  micRsvpNoteLabel: 'RSVP — Notizfeld Label',
  micRsvpNotePlaceholder: 'RSVP — Notizfeld Platzhalter',
  micRsvpSubmit: 'RSVP — Senden-Button',
  micRsvpUpdate: 'RSVP — Aktualisieren-Button',
  micRsvpConfirmation: 'RSVP — Bestätigung (Du-Form)',
  micRsvpConfirmationMulti: 'RSVP — Bestätigung (Ihr-Form)',
  micClosingBody: 'Abschluss — Text',
  micClosingSign: 'Abschluss — Unterschrift',
  micEnableCurtain: 'Vorhang-Animation aktiviert',
  micEnablePetals: 'Blütenblatt-Animation aktiviert',
}

const MIC_TIMETABLE_KEYS: Set<MicContentKey> = new Set(['mic22Timetable', 'mic23Timetable'])
const MIC_TOGGLE_KEYS: Set<MicContentKey> = new Set(['micEnableCurtain', 'micEnablePetals'])

const MIC_SLOT_LABELS: Record<MicImageSlot, string> = {
  hero: 'Hero (Startbild)',
  day22Bg: '22 Jan — Hintergrund',
  day23Bg: '23 Jan — Hintergrund',
  faqBg: 'FAQ — Hintergrund',
  rsvpBg: 'RSVP — Hintergrund',
  closingBg: 'Abschluss — Hintergrund',
}

// ── Human-readable labels for each key ────────────────────────────────────────

const KEY_LABELS: Partial<Record<keyof Translations, string>> = {
  coupleNames: 'Couple names',
  saveTheDate: '"Save the Date" label',
  tapToOpen: '"Tap to open" envelope text',
  ogTitle: 'OG — Couple names (shown in WhatsApp preview)',
  ogSubtitle: 'OG — Subtitle (e.g. "Save the Date")',
  ogDate: 'OG — Date line (e.g. "22 & 23 January 2027")',
  ogLocation: 'OG — Location (e.g. "Berlin")',
  countdownDays: 'Days label',
  countdownHours: 'Hours label',
  countdownMinutes: 'Minutes label',
  countdownSeconds: 'Seconds label',
  inviteHeading: 'Main heading ("We\'re saying yes!")',
  inviteBody22and23: 'Invitation body — guests invited to both days',
  inviteBody23only: 'Invitation body — guests invited to celebration only',
  inviteBody22and23Multi: '[Multi] Envelope card body — both days (DE)',
  inviteBody23onlyMulti: '[Multi] Envelope card body — celebration only (DE)',
  section2Body22and23: 'Page 2 body — guests invited to both days',
  section2Body23only: 'Page 2 body — guests invited to celebration only',
  section2Body22and23Multi: '[Multi] Page 2 body — both days (DE)',
  section2Body23onlyMulti: '[Multi] Page 2 body — celebration only (DE)',
  inviteDate22: 'Date line — wedding day (22 Jan)',
  inviteDate23: 'Date line — celebration day (23 Jan)',
  inviteClosing: 'Closing sign-off',
  calendarLabel: 'Calendar section header ("Mark your calendar")',
  noGuestClosingBody: 'Closing paragraph (shown when no guest token in URL)',
  noGuestClosingSign: 'Closing sign (shown when no guest token in URL)',
  rsvpGreeting: 'RSVP greeting prefix ("Dear")',
  rsvpGreetingMulti: '[Multi] RSVP greeting prefix (DE)',
  rsvpInvited22and23: 'RSVP — invited to both days line',
  rsvpInvited22and23Multi: '[Multi] RSVP — invited to both days (DE)',
  rsvpInvited23only: 'RSVP — invited to celebration only line',
  rsvpInvited23onlyMulti: '[Multi] RSVP — invited to celebration only (DE)',
  rsvpQuestion: 'RSVP question ("Will you be joining us?")',
  rsvpQuestionMulti: '[Multi] RSVP question (DE)',
  rsvpYes: 'RSVP Yes button',
  rsvpNo: 'RSVP No button',
  rsvpMaybe: 'RSVP Maybe button',
  rsvpNote: 'Note field label',
  rsvpNotePlaceholder: 'Note field placeholder',
  rsvpSubmit: 'Submit button',
  rsvpUpdate: 'Update button (when re-submitting)',
  rsvpConfirmation: 'Confirmation message after submit',
  rsvpConfirmationMulti: '[Multi] Confirmation message after submit (DE)',
  rsvpYesMulti: '[Multi] Yes button (DE)',
  // Hindu Wedding — India (28 Jan)
  hindu_ogTitle: 'Hindu OG — Couple names (WhatsApp preview)',
  hindu_ogSubtitle: 'Hindu OG — Subtitle (e.g. "Hindu Wedding")',
  hindu_ogDate: 'Hindu OG — Date line (e.g. "28 January 2027")',
  hindu_ogLocation: 'Hindu OG — Location (e.g. "Kolkata, India")',
  hindu_saveTheDate: 'Hindu — "Save the Date" label',
  hindu_tapToOpen: 'Hindu — "Tap to open" envelope text',
  hindu_inviteHeading: 'Hindu — Main heading',
  hindu_inviteBody: 'Hindu — Invitation body',
  hindu_inviteBodyMulti: 'Hindu — Invitation body (multi-person)',
  hindu_inviteDate: 'Hindu — Date + time line',
  hindu_inviteClosing: 'Hindu — Closing sign-off',
  hindu_calendarLabel: 'Hindu — Calendar section header',
  hindu_venueName: 'Hindu — Venue / temple name',
  hindu_venueAddress: 'Hindu — Venue address',
  hindu_venueDirections: 'Hindu — "Get Directions" button label',
  hindu_rsvpGreeting: 'Hindu — RSVP greeting prefix ("Dear")',
  hindu_rsvpGreetingMulti: 'Hindu — RSVP greeting (multi-person)',
  hindu_rsvpQuestion: 'Hindu — RSVP question',
  hindu_rsvpQuestionMulti: 'Hindu — RSVP question (multi-person)',
  hindu_rsvpYes: 'Hindu — RSVP Yes button',
  hindu_rsvpYesMulti: 'Hindu — RSVP Yes button (multi-person)',
  hindu_rsvpNo: 'Hindu — RSVP No button',
  hindu_rsvpNote: 'Hindu — Note field label',
  hindu_rsvpNotePlaceholder: 'Hindu — Note field placeholder',
  hindu_rsvpSubmit: 'Hindu — Submit button',
  hindu_rsvpUpdate: 'Hindu — Update button',
  hindu_rsvpConfirmation: 'Hindu — Confirmation message',
  hindu_rsvpConfirmationMulti: 'Hindu — Confirmation message (multi-person)',
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function defaultContent(): ContentState {
  const ALL_KEYS = [...GUEST_FACING_KEYS, ...HINDU_GUEST_FACING_KEYS]
  return {
    de: Object.fromEntries(ALL_KEYS.map(k => [k, defaults.de[k]])),
    en: Object.fromEntries(ALL_KEYS.map(k => [k, defaults.en[k]])),
    bn: Object.fromEntries(ALL_KEYS.map(k => [k, defaults.bn[k]])),
  }
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('guests')

  // Deploy state
  const [deploying, setDeploying] = useState(false)
  const [deployStatus, setDeployStatus] = useState<'idle' | 'triggered' | 'error'>('idle')

  // Guests tab state
  const [guests, setGuests] = useState<Guest[]>([])
  const [copied, setCopied] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [activeNote, setActiveNote] = useState<string | null>(null)
  const [generatingMic, setGeneratingMic] = useState<string | null>(null)

  // Content tab state
  const [content, setContent] = useState<ContentState>(defaultContent())
  const [savingContent, setSavingContent] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'pending' | 'saving' | 'saved' | 'error'>('idle')
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const contentRef = useRef<ContentState>(defaultContent())

  // MIC content tab state
  const [micContent, setMicContent] = useState<Record<MicContentKey, string>>(MIC_DEFAULTS)
  const [micSaveStatus, setMicSaveStatus] = useState<'idle' | 'pending' | 'saving' | 'saved' | 'error'>('idle')
  const micSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const micDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const micContentRef = useRef<Record<MicContentKey, string>>(MIC_DEFAULTS)
  const [micUploading, setMicUploading] = useState<string | null>(null)
  const [micUploadStatus, setMicUploadStatus] = useState<Record<string, 'ok' | 'error'>>({})

  // ── Deploy logic ─────────────────────────────────────────────────────────────

  const handleRedeploy = async () => {
    setDeploying(true)
    setDeployStatus('idle')
    const { ok } = await triggerRedeploy()
    setDeploying(false)
    setDeployStatus(ok ? 'triggered' : 'error')
    if (ok) setTimeout(() => setDeployStatus('idle'), 4000)
  }

  // ── Guests tab logic ────────────────────────────────────────────────────────

  const loadGuests = useCallback(() =>
    fetch('/api/guests').then(r => r.json()).then(d => setGuests(d.guests ?? [])), [])

  useEffect(() => { loadGuests() }, [loadGuests])

  const copyLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const deleteGuest = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeleting(id)
    await fetch('/api/guests', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    await loadGuests()
    setDeleting(null)
  }

  const generateMicToken = async (id: string) => {
    setGeneratingMic(id)
    try {
      const res = await fetch(`/api/guests/${id}/generate-mic-token`, { method: 'POST' })
      if (res.ok) await loadGuests()
    } finally {
      setGeneratingMic(null)
    }
  }

  const exportCsv = () => {
    const header = 'Name,Email,Phone,Invited Days,RSVP 22,RSVP 23,RSVP 28,Address,Note,Token,Link DE,Link EN,Link BN'
    const rows = guests.map(g => {
      const base = window.location.origin
      const r = g.rsvp
      const cell = (v: boolean | null | undefined) => (v === null || v === undefined ? '' : v ? 'Yes' : 'No')
      return `"${g.name}","${g.email ?? ''}","${g.phone ?? ''}","${g.invitedDays}","${r ? (r.attending22 === null ? '?' : r.attending22 ? 'Yes' : 'No') : ''}","${cell(r?.attending23)}","${cell(r?.attending28)}","${(r?.address ?? '').replace(/"/g, '""')}","${r?.note ?? ''}","${g.token}","${base}/de/invite/${g.token}","${base}/en/invite/${g.token}","${base}/bn/invite/${g.token}"`
    })
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'guests.csv'; a.click()
  }

  const printPdf = () => {
    const base = window.location.origin
    const rows = guests.map(g => {
      const r = g.rsvp
      const mark = (v: boolean | null | undefined) => (v === null || v === undefined ? '–' : v ? '✓' : '✗')
      const rsvp22 = g.invitedDays === '22+23' ? (r ? (r.attending22 === null ? '?' : r.attending22 ? '✓' : '✗') : '–') : '—'
      const rsvp23 = g.invitedDays === '28' ? '—' : (r ? mark(r.attending23) : '–')
      const rsvp28 = g.invitedDays === '28' ? (r ? mark(r.attending28) : '–') : '—'
      return `<tr>
        <td>${g.name}</td>
        <td>${g.email ?? g.phone ?? '—'}</td>
        <td>${g.invitedDays === '28' ? '28 Jan (India)' : g.invitedDays === '22+23' ? '22 + 23 Jan' : '23 Jan'}</td>
        <td style="text-align:center">${rsvp22}</td>
        <td style="text-align:center">${rsvp23}</td>
        <td style="text-align:center">${rsvp28}</td>
        <td style="font-size:10px;white-space:pre-wrap">${r?.address ?? ''}</td>
        <td>${r?.note ?? ''}</td>
        <td style="font-size:10px">${base}/de/invite/${g.token}</td>
      </tr>`
    }).join('')
    const html = `<!DOCTYPE html><html><head><title>Julia & Ravi — Guest List</title>
    <style>body{font-family:Georgia,serif;padding:24px}h1{font-size:22px;margin-bottom:4px;color:#3a0808}p{font-size:12px;color:#666;margin-bottom:16px}
    table{width:100%;border-collapse:collapse;font-size:12px}th{background:#3a0808;color:#c9a84c;padding:6px 8px;text-align:left}
    td{padding:5px 8px;border-bottom:1px solid #ddd}tr:nth-child(even) td{background:#fdf8f0}
    @media print{button{display:none}}</style></head>
    <body><h1>Julia & Ravi — Guest List</h1><p>Wedding 22 Jan & Celebration 23 Jan 2027 · Berlin · Hindu Wedding 28 Jan · Kolkata · ${guests.length} guests</p>
    <table><thead><tr><th>Name</th><th>Contact</th><th>Invited</th><th>RSVP 22</th><th>RSVP 23</th><th>RSVP 28</th><th>Address</th><th>Note</th><th>Link</th></tr></thead>
    <tbody>${rows}</tbody></table></body></html>`
    const w = window.open('', '_blank')!
    w.document.write(html); w.document.close(); w.print()
  }

  // A guest counts as confirmed if they said yes to any day they were invited to
  const isConfirmed = (g: Guest) => !!(g.rsvp && (g.rsvp.attending23 || g.rsvp.attending22 || g.rsvp.attending28))
  const isDeclined = (g: Guest) => {
    const r = g.rsvp
    if (!r) return false
    if (g.invitedDays === '28') return r.attending28 === false
    return r.attending23 === false && r.attending22 !== true
  }
  const confirmed = guests.filter(isConfirmed).length
  const declined = guests.filter(isDeclined).length
  const pending = guests.filter(g => !g.rsvp).length

  // ── Content tab logic ───────────────────────────────────────────────────────

  useEffect(() => {
    if (tab !== 'content') return
    const controller = new AbortController()
    fetch('/api/content', { signal: controller.signal })
      .then(r => r.json())
      .then((d: ContentState) => setContent(d))
      .catch(() => {/* keep defaults on error */})
    return () => controller.abort()
  }, [tab])

  const handleContentChange = (lang: 'de' | 'en' | 'bn', key: string, value: string) => {
    setContent(prev => {
      const next = { ...prev, [lang]: { ...prev[lang], [key]: value } }
      contentRef.current = next
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => doSave(contentRef.current), 5000)
      setSaveStatus('pending')
      return next
    })
  }

  const doSave = async (data: ContentState) => {
    setSavingContent(true)
    setSaveStatus('saving')
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      setSaveStatus(res.ok ? 'saved' : 'error')
    } catch {
      setSaveStatus('error')
    }
    setSavingContent(false)
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => setSaveStatus('idle'), 3000)
  }

  const handleResetDefaults = () => {
    if (!confirm('Reset all text to built-in defaults? Changes will auto-save after 30 seconds.')) return
    const defaults = defaultContent()
    contentRef.current = defaults
    setContent(defaults)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSave(contentRef.current), 5000)
  }

  // ── MIC content logic ───────────────────────────────────────────────────────

  useEffect(() => {
    if (tab !== 'mic') return
    const controller = new AbortController()
    fetch('/api/mic-content', { signal: controller.signal })
      .then(r => r.json())
      .then((d: Record<MicContentKey, string>) => {
        setMicContent(d)
        micContentRef.current = d
      })
      .catch(() => {/* keep defaults */})
    return () => controller.abort()
  }, [tab])

  const handleMicChange = (key: MicContentKey, value: string) => {
    setMicContent(prev => {
      const next = { ...prev, [key]: value }
      micContentRef.current = next
      if (micDebounceRef.current) clearTimeout(micDebounceRef.current)
      micDebounceRef.current = setTimeout(() => doMicSave(micContentRef.current), 5000)
      setMicSaveStatus('pending')
      return next
    })
  }

  const doMicSave = async (data: Record<MicContentKey, string>) => {
    setMicSaveStatus('saving')
    try {
      const res = await fetch('/api/mic-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      setMicSaveStatus(res.ok ? 'saved' : 'error')
    } catch {
      setMicSaveStatus('error')
    }
    if (micSaveTimerRef.current) clearTimeout(micSaveTimerRef.current)
    micSaveTimerRef.current = setTimeout(() => setMicSaveStatus('idle'), 3000)
  }

  const handleMicImageUpload = async (slot: MicImageSlot, variant: string, file: File) => {
    const key = `${slot}/${variant}`
    setMicUploading(key)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch(`/api/mic-images/upload?slot=${slot}&variant=${variant}`, {
        method: 'POST',
        body: form,
      })
      setMicUploadStatus(prev => ({ ...prev, [key]: res.ok ? 'ok' : 'error' }))
    } catch {
      setMicUploadStatus(prev => ({ ...prev, [key]: 'error' }))
    }
    setMicUploading(null)
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const toastVisible = saveStatus !== 'idle'

  return (
    <div className="h-screen text-[#f5f0e8] p-6 relative flex flex-col overflow-hidden"
      style={{ backgroundImage: 'url(/photos/rose/roses.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />
      <div className="relative z-10 w-full max-w-7xl mx-auto flex-1 flex flex-col min-h-0">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-script text-4xl text-[#c9a84c]">Julia & Ravi</h1>
            <p className="font-serif text-[#f5f0e8]/50 text-sm tracking-widest uppercase mt-1">Guest Management</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={exportCsv}
              className="border border-[#c9a84c]/60 text-[#c9a84c] px-3 py-2 rounded-lg font-serif text-xs hover:bg-[#c9a84c]/10 transition-colors">
              CSV
            </button>
            <button onClick={printPdf}
              className="border border-[#c9a84c]/60 text-[#c9a84c] px-3 py-2 rounded-lg font-serif text-xs hover:bg-[#c9a84c]/10 transition-colors">
              Print PDF
            </button>
            <button onClick={handleRedeploy} disabled={deploying}
              className="border border-[#c9a84c]/60 text-[#c9a84c] px-3 py-2 rounded-lg font-serif text-xs hover:bg-[#c9a84c]/10 transition-colors disabled:opacity-50">
              {deploying ? 'Deploying…' : deployStatus === 'triggered' ? 'Triggered ✓' : deployStatus === 'error' ? 'Failed ✗' : 'Redeploy'}
            </button>
            <Link href="/admin/create"
              className="bg-[#c9a84c] text-[#1a0a0a] px-4 py-2 rounded-lg font-serif text-sm font-semibold hover:bg-[#e0bd6e] transition-colors">
              + Add Guest
            </Link>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mb-6 bg-black/30 rounded-xl p-1 w-fit">
          {(['guests', 'content', 'mic'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg font-serif text-sm transition-all ${
                tab === t
                  ? 'bg-[#c9a84c] text-[#1a0a0a] font-semibold'
                  : 'text-[#f5f0e8]/60 hover:text-[#f5f0e8]'
              }`}
            >
              {t === 'guests' ? 'Guests' : t === 'content' ? 'Save-the-Date' : 'Einladung (MIC)'}
            </button>
          ))}
        </div>

        {/* ── Guests tab ── */}
        {tab === 'guests' && (
          <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto min-h-0 scrollbar-gold pr-2 pb-6" style={{ paddingBottom: "50px", marginBottom: "30px"}}>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {[
                { label: 'Invited', value: guests.length, color: '#c9a84c' },
                { label: 'Confirmed', value: confirmed, color: '#4ade80' },
                { label: 'Declined', value: declined, color: '#f87171' },
                { label: 'Pending', value: pending, color: '#94a3b8' },
              ].map(s => (
                <div key={s.label} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-center shadow-lg">
                  <div className="text-3xl font-serif" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-xs font-serif text-[#f5f0e8]/50 mt-1 uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Guest cards */}
            {guests.length === 0 ? (
              <p className="text-center text-[#f5f0e8]/30 font-serif py-12">No guests added yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {guests.map(g => {
                  const base = typeof window !== 'undefined' ? window.location.origin : ''
                  const linkDe = `${base}/de/invite/${g.token}`
                  const linkEn = `${base}/en/invite/${g.token}`
                  const linkBn = `${base}/bn/invite/${g.token}`
                  const isHindu = g.invitedDays === '28'
                  const r = g.rsvp
                  const rsvp22val = g.invitedDays === '22+23'
                    ? (r ? (r.attending22 === null ? { label: '?', color: 'text-[#f5f0e8]/40' } : r.attending22 ? { label: 'Yes', color: 'text-green-400' } : { label: 'No', color: 'text-red-400' }) : { label: '–', color: 'text-[#f5f0e8]/30' })
                    : null
                  const boolToVal = (v: boolean | null | undefined) =>
                    v === true ? { label: 'Yes', color: 'text-green-400' } : v === false ? { label: 'No', color: 'text-red-400' } : { label: '–', color: 'text-[#f5f0e8]/30' }
                  const rsvp23val = r ? boolToVal(r.attending23) : { label: '–', color: 'text-[#f5f0e8]/30' }
                  const rsvp28val = r ? boolToVal(r.attending28) : { label: '–', color: 'text-[#f5f0e8]/30' }
                  const initials = g.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                  return (
                    <div key={g.id} className="relative bg-black/50 backdrop-blur-xl border border-[#c9a84c]/30 rounded-2xl p-5 shadow-xl flex flex-col gap-4">

                      {/* Header: avatar + name + delete */}
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full border-2 border-[#c9a84c]/60 bg-[#4a0a0a]/80 flex items-center justify-center shrink-0">
                          <span className="font-script text-[#c9a84c] text-lg leading-none">{initials}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-serif text-white font-semibold text-lg leading-tight">{g.name}</span>
                            {g.isMulti && (
                              <span className="px-1.5 py-0.5 rounded text-[11px] bg-[#c9a84c]/20 text-[#c9a84c] border border-[#c9a84c]/40 font-serif">Group</span>
                            )}
                            {isHindu && (
                              <span className="px-1.5 py-0.5 rounded text-[11px] bg-orange-400/20 text-orange-300 border border-orange-400/40 font-serif">India</span>
                            )}
                            {g.isBengali && (
                              <span className="px-1.5 py-0.5 rounded text-[11px] bg-[#c9a84c]/20 text-[#c9a84c] border border-[#c9a84c]/40 font-serif">বাং</span>
                            )}
                          </div>
                          <p className="text-white/50 font-serif text-xs mt-0.5">Invitation & Contact Details</p>
                        </div>
                        <button
                          onClick={() => deleteGuest(g.id, g.name)}
                          disabled={deleting === g.id}
                          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-400/60 text-red-400 bg-red-400/10 hover:bg-red-400/20 hover:border-red-400 transition-all font-serif text-sm font-medium disabled:opacity-30"
                        >
                          {deleting === g.id ? '…' : '✕ Delete'}
                        </button>
                      </div>

                      {/* Contact + Invited row */}
                      <div className="flex gap-3">
                        <div className="flex-1 bg-white/10 border border-white/20 rounded-xl p-3 flex items-center gap-2 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-[#c9a84c]/15 border border-[#c9a84c]/30 flex items-center justify-center shrink-0 text-[#c9a84c]">✉</div>
                          <div className="min-w-0">
                            <p className="text-[#c9a84c] text-[10px] uppercase tracking-wider font-serif mb-0.5">Contact</p>
                            <p className="text-white text-sm font-serif break-all">{g.email ?? g.phone ?? '—'}</p>
                          </div>
                        </div>
                        <div className="bg-white/10 border border-white/20 rounded-xl p-3 flex items-center gap-2 shrink-0">
                          <div className="w-9 h-9 rounded-lg bg-[#c9a84c]/15 border border-[#c9a84c]/30 flex items-center justify-center text-[#c9a84c]">📅</div>
                          <div>
                            <p className="text-[#c9a84c] text-[10px] uppercase tracking-wider font-serif mb-0.5">Invited</p>
                            <p className="text-white text-sm font-serif whitespace-nowrap">{isHindu ? '28 Jan (India)' : g.invitedDays === '22+23' ? '22–23 Jan' : '23 Jan'}</p>
                          </div>
                        </div>
                      </div>

                      {/* RSVP row */}
                      <div className="bg-white/8 border border-white/20 rounded-xl p-3 flex items-center gap-3">
                        {isHindu ? (
                          <>
                            <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${r?.attending28 ? 'bg-green-400/15 border-green-400/40 text-green-400' : 'bg-[#c9a84c]/15 border-[#c9a84c]/30 text-[#c9a84c]'}`}>👥</div>
                            <div className="flex-1">
                              <p className="text-[#c9a84c] text-[10px] uppercase tracking-wider font-serif mb-0.5">RSVP 28</p>
                              <p className={`text-sm font-serif font-semibold ${rsvp28val.color}`}>{rsvp28val.label === 'Yes' ? '✓ ' : rsvp28val.label === 'No' ? '✕ ' : ''}{rsvp28val.label}</p>
                            </div>
                          </>
                        ) : (
                          <>
                        {g.invitedDays === '22+23' && rsvp22val && (
                          <>
                            <div className="w-9 h-9 rounded-lg bg-[#c9a84c]/15 border border-[#c9a84c]/30 flex items-center justify-center text-[#c9a84c] shrink-0">👥</div>
                            <div className="flex-1">
                              <p className="text-[#c9a84c] text-[10px] uppercase tracking-wider font-serif mb-0.5">RSVP 22</p>
                              <p className={`text-sm font-serif font-semibold ${rsvp22val.color}`}>{rsvp22val.label === 'Yes' ? '✓ ' : rsvp22val.label === 'No' ? '✕ ' : ''}{rsvp22val.label}</p>
                            </div>
                            <div className="w-px h-8 bg-white/20" />
                          </>
                        )}
                        <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${r?.attending23 ? 'bg-green-400/15 border-green-400/40 text-green-400' : 'bg-[#c9a84c]/15 border-[#c9a84c]/30 text-[#c9a84c]'}`}>👥</div>
                        <div className="flex-1">
                          <p className="text-[#c9a84c] text-[10px] uppercase tracking-wider font-serif mb-0.5">RSVP 23</p>
                          <p className={`text-sm font-serif font-semibold ${rsvp23val.color}`}>{rsvp23val.label === 'Yes' ? '✓ ' : rsvp23val.label === 'No' ? '✕ ' : ''}{rsvp23val.label}</p>
                        </div>
                          </>
                        )}
                        {r?.note && (
                          <>
                            <div className="w-px h-8 bg-white/20" />
                            <div className="relative">
                              <button
                                onClick={() => setActiveNote(activeNote === r.note ? null : r.note ?? null)}
                                className="w-9 h-9 rounded-lg bg-[#c9a84c]/15 border border-[#c9a84c]/30 flex items-center justify-center text-[#c9a84c] shrink-0"
                              >💬</button>
                              {activeNote === r.note && (
                                <div className="absolute right-0 bottom-full mb-2 z-50 w-64 bg-[#1a0a0a] border border-[#c9a84c]/40 rounded-xl p-3 shadow-xl text-sm text-[#f5f0e8] font-serif break-words">
                                  {r.note}
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Address row */}
                      {r?.address && (
                        <div className="bg-white/8 border border-white/20 rounded-xl p-3 flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg bg-[#c9a84c]/15 border border-[#c9a84c]/30 flex items-center justify-center text-[#c9a84c] shrink-0 mt-0.5">✉️</div>
                          <div className="min-w-0">
                            <p className="text-[#c9a84c] text-[10px] uppercase tracking-wider font-serif mb-0.5">Address</p>
                            <p className="text-white text-sm font-serif whitespace-pre-wrap break-words">{r.address}</p>
                          </div>
                        </div>
                      )}

                      {/* Links row */}
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#c9a84c]/15 border border-[#c9a84c]/30 flex items-center justify-center text-[#c9a84c] shrink-0">🔗</div>
                        <span className="text-[#c9a84c] text-[10px] uppercase tracking-wider font-serif">{isHindu ? 'Links' : 'STD'}</span>
                        <div className="flex gap-2 ml-1">
                          {isHindu ? (
                            <>
                              <button onClick={() => copyLink(linkEn, `en-${g.id}`)}
                                className="px-4 py-2 rounded-lg border border-[#c9a84c]/50 bg-[#c9a84c]/10 text-white font-serif text-sm font-semibold hover:bg-[#c9a84c]/20 hover:border-[#c9a84c] transition-all">
                                {copied === `en-${g.id}` ? '✓' : 'EN'}
                              </button>
                              {g.isBengali && (
                                <button onClick={() => copyLink(linkBn, `bn-${g.id}`)}
                                  className="px-4 py-2 rounded-lg border border-[#c9a84c]/50 bg-[#c9a84c]/10 text-white font-serif text-sm font-semibold hover:bg-[#c9a84c]/20 hover:border-[#c9a84c] transition-all">
                                  {copied === `bn-${g.id}` ? '✓' : 'বাং'}
                                </button>
                              )}
                            </>
                          ) : (
                            <>
                              <button onClick={() => copyLink(linkDe, `de-${g.id}`)}
                                className="px-4 py-2 rounded-lg border border-[#c9a84c]/50 bg-[#c9a84c]/10 text-white font-serif text-sm font-semibold hover:bg-[#c9a84c]/20 hover:border-[#c9a84c] transition-all">
                                {copied === `de-${g.id}` ? '✓' : 'DE'}
                              </button>
                              <button onClick={() => copyLink(linkEn, `en-${g.id}`)}
                                className="px-4 py-2 rounded-lg border border-[#c9a84c]/50 bg-[#c9a84c]/10 text-white font-serif text-sm font-semibold hover:bg-[#c9a84c]/20 hover:border-[#c9a84c] transition-all">
                                {copied === `en-${g.id}` ? '✓' : 'EN'}
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* MIC Link row — Berlin guests only */}
                      {!isHindu && (
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-[#c9a84c]/15 border border-[#c9a84c]/30 flex items-center justify-center text-[#c9a84c] shrink-0">💍</div>
                          <span className="text-[#c9a84c] text-[10px] uppercase tracking-wider font-serif">MIC</span>
                          <div className="flex gap-2 ml-1">
                            {g.micToken ? (
                              <button
                                onClick={() => copyLink(`${base}/hochzeit-einladung/${g.micToken}`, `mic-${g.id}`)}
                                className="px-4 py-2 rounded-lg border border-[#c9a84c]/50 bg-[#c9a84c]/10 text-white font-serif text-sm font-semibold hover:bg-[#c9a84c]/20 hover:border-[#c9a84c] transition-all"
                                title={`${base}/hochzeit-einladung/${g.micToken}`}
                              >
                                {copied === `mic-${g.id}` ? '✓ Kopiert' : 'Link kopieren'}
                              </button>
                            ) : (
                              <button
                                onClick={() => generateMicToken(g.id)}
                                disabled={generatingMic === g.id}
                                className="px-4 py-2 rounded-lg border border-[#c9a84c]/40 bg-transparent text-[#c9a84c] font-serif text-sm hover:bg-[#c9a84c]/10 hover:border-[#c9a84c] transition-all disabled:opacity-30"
                              >
                                {generatingMic === g.id ? '…' : 'Generieren'}
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                    </div>
                  )
                })}
              </div>
            )}
          </div>
          </div>
        )}

        {/* ── Content tab ── */}
        {tab === 'content' && (
          <div className="max-w-5xl flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto min-h-0 pr-2 pb-6 scrollbar-gold">
                <div className="flex items-center justify-between mb-6">
                  <p className="font-serif text-[#f5f0e8]/50 text-sm">
                    Edit guest-facing invitation text. Auto-saves 5s after changes.
                  </p>
                  <button
                    onClick={handleResetDefaults}
                    disabled
                    className="shrink-0 border border-[#c9a84c]/20 text-[#c9a84c]/30 font-serif text-xs px-3 py-1.5 rounded-lg cursor-not-allowed ml-4"
                  >
                    Reset to defaults
                  </button>
                </div>

                {CONTENT_GROUPS.map(group => (
                  <div key={group.label} className="mb-8">
                    <h2 className="font-serif text-[#c9a84c] text-xs uppercase tracking-widest mb-4 border-b border-[#c9a84c]/20 pb-2">
                      {group.label}
                    </h2>
                    <div className="flex flex-col gap-4">
                      {group.keys.map(key => {
                        const editLangs: ('de' | 'en' | 'bn')[] = group.deOnly ? ['de'] : group.enBn ? ['en', 'bn'] : ['de', 'en']
                        const langLabel: Record<'de' | 'en' | 'bn', string> = { de: 'German', en: 'English', bn: 'Bengali' }
                        return (
                        <div key={key} className="bg-black/40 backdrop-blur-md border border-[#c9a84c]/20 rounded-xl p-4">
                          <p className="font-serif text-[#f5f0e8]/60 text-xs mb-3">
                            {KEY_LABELS[key] ?? key}
                          </p>
                          <div className={`grid gap-3 ${editLangs.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                            {editLangs.map(lang => (
                              <div key={lang}>
                                {editLangs.length > 1 && (
                                  <label className="block text-[#c9a84c]/70 text-xs font-serif mb-1 uppercase tracking-wider">
                                    {langLabel[lang]}
                                  </label>
                                )}
                                <textarea
                                  value={content[lang][key] ?? ''}
                                  onChange={e => handleContentChange(lang, key, e.target.value)}
                                  rows={key.includes('Body') || key.includes('body') ? 4 : 2}
                                  className="w-full bg-black/30 border border-[#c9a84c]/20 rounded-lg px-3 py-2 text-[#f5f0e8] font-serif text-sm focus:outline-none focus:border-[#c9a84c]/60 resize-y"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
            </div>

            <div className="flex items-center pt-3 pb-2 border-t border-[#c9a84c]/10 mt-2 min-h-[2rem]">
              {(saveStatus === 'pending' || saveStatus === 'saving') && (
                <span className="font-serif text-[#c9a84c]/60 text-xs">{saveStatus === 'pending' ? 'Unsaved changes…' : 'Saving…'}</span>
              )}
              {saveStatus === 'saved' && (
                <span className="font-serif text-green-400 text-xs">Saved ✓</span>
              )}
              {saveStatus === 'error' && (
                <span className="font-serif text-red-400 text-xs">Save failed — will retry on next change</span>
              )}
            </div>
          </div>
        )}
        {/* ── MIC Content tab ── */}
        {tab === 'mic' && (
          <div className="max-w-5xl flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto min-h-0 pr-2 pb-6 scrollbar-gold">
              <p className="font-serif text-[#f5f0e8]/50 text-sm mb-6">
                Einladungstext bearbeiten. Automatisch gespeichert 5s nach Änderung.
              </p>

              {/* Image upload section */}
              <div className="mb-8">
                <h2 className="font-serif text-[#c9a84c] text-xs uppercase tracking-widest mb-4 border-b border-[#c9a84c]/20 pb-2">
                  Bilder hochladen
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {MIC_IMAGE_SLOTS.map(slot => {
                    const variants = slot === 'hero'
                      ? ['mobile', 'tablet', 'desktop']
                      : ['default']
                    return (
                      <div key={slot} className="bg-black/40 backdrop-blur-md border border-[#c9a84c]/20 rounded-xl p-4">
                        <p className="font-serif text-[#f5f0e8]/60 text-xs mb-3">
                          {MIC_SLOT_LABELS[slot]}
                        </p>
                        <div className="flex flex-col gap-2">
                          {variants.map(v => {
                            const key = `${slot}/${v}`
                            const isUp = micUploading === key
                            const status = micUploadStatus[key]
                            return (
                              <label key={v} className="flex items-center gap-3 cursor-pointer group">
                                <span className="font-serif text-[#c9a84c]/70 text-xs w-16 shrink-0 uppercase tracking-wider">
                                  {slot === 'hero' ? v : 'Bild'}
                                </span>
                                <div className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                                  isUp
                                    ? 'border-[#c9a84c]/60 bg-[#c9a84c]/5'
                                    : 'border-[#c9a84c]/20 bg-black/20 hover:border-[#c9a84c]/40 group-hover:bg-black/30'
                                }`}>
                                  {isUp ? (
                                    <span className="font-serif text-[#c9a84c]/60 text-xs animate-pulse">Hochladen…</span>
                                  ) : (
                                    <>
                                      <span className="font-serif text-[#f5f0e8]/40 text-xs flex-1">
                                        {status === 'ok' ? '✓ Hochgeladen' : status === 'error' ? '✕ Fehler' : 'Datei wählen…'}
                                      </span>
                                      <span className="text-[#c9a84c] text-sm">↑</span>
                                    </>
                                  )}
                                </div>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="sr-only"
                                  disabled={!!micUploading}
                                  onChange={e => {
                                    const f = e.target.files?.[0]
                                    if (f) handleMicImageUpload(slot, v, f)
                                    e.target.value = ''
                                  }}
                                />
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Content key groups */}
              {MIC_GROUPS.map(group => (
                <div key={group.label} className="mb-8">
                  <h2 className="font-serif text-[#c9a84c] text-xs uppercase tracking-widest mb-4 border-b border-[#c9a84c]/20 pb-2">
                    {group.label}
                  </h2>
                  <div className="flex flex-col gap-4">
                    {group.keys.map(key => {
                      const isToggle = MIC_TOGGLE_KEYS.has(key)
                      const isTimetable = MIC_TIMETABLE_KEYS.has(key)
                      return (
                        <div key={key} className="bg-black/40 backdrop-blur-md border border-[#c9a84c]/20 rounded-xl p-4">
                          <p className="font-serif text-[#f5f0e8]/60 text-xs mb-3">
                            {MIC_KEY_LABELS[key] ?? key}
                          </p>
                          {isToggle ? (
                            <label className="flex items-center gap-3 cursor-pointer">
                              <div
                                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                                  micContent[key] === 'true' ? 'bg-[#c9a84c]' : 'bg-white/20'
                                }`}
                                onClick={() => handleMicChange(key, micContent[key] === 'true' ? 'false' : 'true')}
                              >
                                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                                  micContent[key] === 'true' ? 'translate-x-5' : 'translate-x-0.5'
                                }`} />
                              </div>
                              <span className="font-serif text-[#f5f0e8] text-sm">
                                {micContent[key] === 'true' ? 'Aktiviert' : 'Deaktiviert'}
                              </span>
                            </label>
                          ) : isTimetable ? (
                            <TimetableEditor
                              value={micContent[key] ?? ''}
                              onChange={v => handleMicChange(key, v)}
                            />
                          ) : (
                            <textarea
                              value={micContent[key] ?? ''}
                              onChange={e => handleMicChange(key, e.target.value)}
                              rows={key.includes('Body') || key.includes('body') ? 4 : 2}
                              className="w-full bg-black/30 border border-[#c9a84c]/20 rounded-lg px-3 py-2 text-[#f5f0e8] font-serif text-sm focus:outline-none focus:border-[#c9a84c]/60 resize-y"
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center pt-3 pb-2 border-t border-[#c9a84c]/10 mt-2 min-h-[2rem]">
              {(micSaveStatus === 'pending' || micSaveStatus === 'saving') && (
                <span className="font-serif text-[#c9a84c]/60 text-xs">{micSaveStatus === 'pending' ? 'Nicht gespeichert…' : 'Speichern…'}</span>
              )}
              {micSaveStatus === 'saved' && (
                <span className="font-serif text-green-400 text-xs">Gespeichert ✓</span>
              )}
              {micSaveStatus === 'error' && (
                <span className="font-serif text-red-400 text-xs">Fehler beim Speichern — wird beim nächsten Ändern wiederholt</span>
              )}
            </div>
          </div>
        )}
        {/* Version overlay */}
        <p className="fixed bottom-2 right-3 z-20 font-serif text-[#f5f0e8]/20 text-[10px] tracking-widest pointer-events-none">
          {process.env.NEXT_PUBLIC_COMMIT_SHA ?? 'local'}
        </p>

        {/* Save toast */}
        <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${toastVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-serif text-sm shadow-2xl border backdrop-blur-md ${
            saveStatus === 'saved' ? 'bg-black/70 border-green-400/30 text-green-400' :
            saveStatus === 'error' ? 'bg-black/70 border-red-400/30 text-red-400' :
            'bg-black/70 border-[#c9a84c]/30 text-[#c9a84c]/70'
          }`}>
            {(saveStatus === 'pending' || saveStatus === 'saving') && <span className="animate-pulse">●</span>}
            {saveStatus === 'pending' ? 'Unsaved changes…' :
             saveStatus === 'saving' ? 'Saving…' :
             saveStatus === 'saved' ? '✓ Saved' : '✕ Save failed'}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── TimetableEditor ────────────────────────────────────────────────────────────
// Parses the multiline "HH:MM Uhr   Label" string into structured rows,
// lets the admin edit each row with individual inputs, and serialises back.

interface TimetableRow { time: string; label: string }

function parseTimetable(raw: string): TimetableRow[] {
  return raw
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .map(line => {
      const m = line.match(/^([^\t ]{2,12}(?:\s+Uhr)?)\s{2,}(.+)$/)
      return m ? { time: m[1].trim(), label: m[2].trim() } : { time: '', label: line }
    })
}

function serialiseTimetable(rows: TimetableRow[]): string {
  return rows
    .filter(r => r.time || r.label)
    .map(r => `${r.time}   ${r.label}`)
    .join('\n')
}

function TimetableEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [rows, setRows] = useState<TimetableRow[]>(() => {
    const parsed = parseTimetable(value)
    return parsed.length ? parsed : [{ time: '', label: '' }]
  })

  // Resync when the parent loads DB content (value changes from default → DB value)
  const prevValueRef = useRef(value)
  useEffect(() => {
    if (value !== prevValueRef.current) {
      prevValueRef.current = value
      const parsed = parseTimetable(value)
      setRows(parsed.length ? parsed : [{ time: '', label: '' }])
    }
  }, [value])

  const update = (next: TimetableRow[]) => {
    setRows(next)
    onChange(serialiseTimetable(next))
  }

  const setRow = (i: number, field: 'time' | 'label', v: string) => {
    const next = rows.map((r, idx) => idx === i ? { ...r, [field]: v } : r)
    update(next)
  }

  const addRow = () => update([...rows, { time: '', label: '' }])

  const removeRow = (i: number) => {
    const next = rows.filter((_, idx) => idx !== i)
    update(next.length ? next : [{ time: '', label: '' }])
  }

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            type="text"
            value={row.time}
            onChange={e => setRow(i, 'time', e.target.value)}
            placeholder="14:00 Uhr"
            className="w-28 shrink-0 bg-black/30 border border-[#c9a84c]/20 rounded-lg px-3 py-2 text-[#c9a84c] font-serif text-sm focus:outline-none focus:border-[#c9a84c]/60"
          />
          <input
            type="text"
            value={row.label}
            onChange={e => setRow(i, 'label', e.target.value)}
            placeholder="Beschreibung"
            className="flex-1 bg-black/30 border border-[#c9a84c]/20 rounded-lg px-3 py-2 text-[#f5f0e8] font-serif text-sm focus:outline-none focus:border-[#c9a84c]/60"
          />
          <button
            onClick={() => removeRow(i)}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg border border-red-400/30 text-red-400/60 hover:border-red-400 hover:text-red-400 transition-colors text-sm"
            title="Eintrag entfernen"
          >✕</button>
        </div>
      ))}
      <button
        onClick={addRow}
        className="self-start mt-1 px-3 py-1.5 rounded-lg border border-[#c9a84c]/30 text-[#c9a84c]/70 font-serif text-xs hover:border-[#c9a84c]/60 hover:text-[#c9a84c] transition-colors"
      >
        + Eintrag hinzufügen
      </button>
    </div>
  )
}
