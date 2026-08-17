# DB-Driven Invitation Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move all guest-facing invitation text (DE + EN) into a Neon DB table so it can be edited live from the admin page without a code deploy.

**Architecture:** A new `content` table stores key/lang/value rows. On every invite page render (server component), one DB query fetches all overrides and deep-merges them over the static defaults in `lib/i18n.ts`. A `translations` prop threads the merged result down the component tree. The admin page gains a "Content" tab with a grouped textarea form that loads current values and POSTs saves to `/api/content`.

**Tech Stack:** Next.js 16 App Router · Drizzle ORM · Neon (Postgres) · React 19 · Tailwind CSS v4 · TypeScript strict

## Global Constraints

- No new npm dependencies.
- All guest-facing text keys only — admin UI labels stay hardcoded.
- Static `translations` object in `lib/i18n.ts` remains as the fallback/seed; DB values override it.
- Admin page must be entirely in English.
- `t()` helper must remain backward-compatible (existing call-sites not in the prop-threading path must still work).
- No migration runner — provide `CREATE TABLE` SQL to be run once in Neon console.
- `content` table seeded with all defaults at first-save time (form ships pre-populated from static defaults, first Save writes all rows to DB).

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `lib/schema.ts` | Modify | Add `content` table definition |
| `lib/i18n.ts` | Modify | Add 3 new keys, add `loadTranslations()`, keep `t()` |
| `app/api/content/route.ts` | Create | GET (load) + POST (save), admin-gated |
| `app/[lang]/invite/[token]/page.tsx` | Modify | Call `loadTranslations()`, pass translations prop |
| `components/ScrollInvitation.tsx` | Modify | Accept `translations` prop, fix 3 hardcoded strings |
| `components/InvitationCard.tsx` | Modify | Accept + use `translations` prop |
| `components/RsvpForm.tsx` | Modify | Accept + use `translations` prop |
| `components/CountdownTimer.tsx` | Modify | Accept + use `translations` prop |
| `components/EnvelopeAnimation.tsx` | Modify | Accept + use `translations` prop |
| `app/admin/page.tsx` | Modify | English labels, tab bar (Guests / Content), Content tab form |

---

## Task 1: DB Schema — `content` table

**Files:**
- Modify: `lib/schema.ts`

**Interfaces:**
- Produces: `content` Drizzle table exported as `content`, with columns `id`, `key`, `lang`, `value`, `updatedAt`; unique constraint on `(key, lang)`.

- [ ] **Step 1: Add `content` table to schema**

Replace the contents of `lib/schema.ts` with:

```typescript
import { pgTable, uuid, varchar, boolean, text, timestamp, unique } from 'drizzle-orm/pg-core'

export const guests = pgTable('guests', {
  id: uuid('id').primaryKey().defaultRandom(),
  token: varchar('token', { length: 12 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 200 }),
  phone: varchar('phone', { length: 30 }),
  invitedDays: varchar('invited_days', { length: 10 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const rsvps = pgTable('rsvps', {
  id: uuid('id').primaryKey().defaultRandom(),
  guestId: uuid('guest_id').notNull().references(() => guests.id),
  attending22: boolean('attending_22'),
  attending23: boolean('attending_23').notNull(),
  note: text('note'),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const content = pgTable('content', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: varchar('key', { length: 60 }).notNull(),
  lang: varchar('lang', { length: 2 }).notNull(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [unique().on(t.key, t.lang)])
```

- [ ] **Step 2: Run this SQL once in Neon console**

```sql
CREATE TABLE IF NOT EXISTS content (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key       varchar(60)  NOT NULL,
  lang      varchar(2)   NOT NULL,
  value     text         NOT NULL,
  updated_at timestamp   NOT NULL DEFAULT now(),
  UNIQUE(key, lang)
);
```

- [ ] **Step 3: Verify table exists**

In Neon console run `SELECT * FROM content LIMIT 1;` — should return 0 rows with no error.

- [ ] **Step 4: Commit**

```bash
git add lib/schema.ts
git commit -m "feat: add content table to schema"
```

---

## Task 2: i18n — add 3 new keys + `loadTranslations()`

**Files:**
- Modify: `lib/i18n.ts`

**Interfaces:**
- Consumes: `content` table via `db` from `lib/db.ts`
- Produces:
  - `Translations` interface extended with `calendarLabel`, `noGuestClosingBody`, `noGuestClosingSign`
  - `loadTranslations(lang: Lang): Promise<Translations>` — queries DB, merges over defaults, returns merged object
  - `t(key: keyof Translations, lang: Lang, overrides?: Partial<Translations>): string` — backward-compatible, uses `overrides` when provided

- [ ] **Step 1: Replace `lib/i18n.ts` with the extended version**

```typescript
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
      overrides[row.key as keyof Translations] = row.value
    }
    return { ...translations[lang], ...overrides }
  } catch {
    return translations[lang]
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/i18n.ts
git commit -m "feat: add 3 new i18n keys + loadTranslations() from DB"
```

---

## Task 3: API route — `/api/content`

**Files:**
- Create: `app/api/content/route.ts`

**Interfaces:**
- Consumes: `db`, `content` table, `translations` defaults, `GUEST_FACING_KEYS` from `lib/i18n.ts`; `isAdmin` pattern from `app/api/guests/route.ts`
- Produces:
  - `GET /api/content` → `{ de: Record<string,string>, en: Record<string,string> }` — defaults merged with DB overrides, admin-gated
  - `POST /api/content` body: `{ de: Record<string,string>, en: Record<string,string> }` → upserts all guest-facing key+lang rows, admin-gated

- [ ] **Step 1: Create `app/api/content/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { content } from '@/lib/schema'
import { translations, GUEST_FACING_KEYS, type Lang } from '@/lib/i18n'
import { eq, and } from 'drizzle-orm'

function isAdmin(req: NextRequest) {
  return req.cookies.get('admin-auth')?.value === process.env.ADMIN_PASSWORD
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await db.select().from(content)
  const result: Record<Lang, Record<string, string>> = {
    de: { ...Object.fromEntries(GUEST_FACING_KEYS.map(k => [k, translations.de[k]])) },
    en: { ...Object.fromEntries(GUEST_FACING_KEYS.map(k => [k, translations.en[k]])) },
  }
  for (const row of rows) {
    if (row.lang === 'de' || row.lang === 'en') {
      result[row.lang][row.key] = row.value
    }
  }
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body: { de: Record<string, string>; en: Record<string, string> } = await req.json()

  const upserts: Promise<unknown>[] = []
  for (const lang of ['de', 'en'] as const) {
    for (const key of GUEST_FACING_KEYS) {
      const value = body[lang]?.[key]
      if (value === undefined) continue
      upserts.push(
        db.insert(content)
          .values({ key, lang, value })
          .onConflictDoUpdate({
            target: [content.key, content.lang],
            set: { value, updatedAt: new Date() },
          })
      )
    }
  }
  await Promise.all(upserts)
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/content/route.ts
git commit -m "feat: add /api/content GET+POST for admin content management"
```

---

## Task 4: Thread `translations` prop through components

**Files:**
- Modify: `components/CountdownTimer.tsx`
- Modify: `components/EnvelopeAnimation.tsx`
- Modify: `components/InvitationCard.tsx`
- Modify: `components/RsvpForm.tsx`
- Modify: `components/ScrollInvitation.tsx`
- Modify: `app/[lang]/invite/[token]/page.tsx`

**Interfaces:**
- Consumes: `loadTranslations(lang)` from Task 2
- Produces: All invitation components accept `translations: Translations` prop and use it instead of calling `t(key, lang)` globally

- [ ] **Step 1: Update `components/CountdownTimer.tsx`**

```typescript
'use client'
import { useEffect, useState } from 'react'
import type { Lang, Translations } from '@/lib/i18n'

interface Props { lang: Lang; translations: Translations }

const WEDDING_DATE = new Date('2027-01-22T00:00:00')

export default function CountdownTimer({ translations }: Props) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const tick = () => {
      const diff = WEDDING_DATE.getTime() - Date.now()
      if (diff <= 0) return
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex gap-6 justify-center">
      {[
        { value: timeLeft.days,    label: translations.countdownDays },
        { value: timeLeft.hours,   label: translations.countdownHours },
        { value: timeLeft.minutes, label: translations.countdownMinutes },
        { value: timeLeft.seconds, label: translations.countdownSeconds },
      ].map(({ value, label }) => (
        <div key={label} className="text-center">
          <div className="text-2xl sm:text-4xl font-serif text-[#c9a84c] tabular-nums">
            {String(value).padStart(2, '0')}
          </div>
          <div className="text-xs font-serif text-[#f5f0e8]/60 uppercase tracking-widest mt-1">{label}</div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Update `components/EnvelopeAnimation.tsx`**

```typescript
'use client'
import { useState } from 'react'
import type { Lang, Translations } from '@/lib/i18n'
import InvitationCard from './InvitationCard'

interface Props { lang: Lang; translations: Translations; onOpen?: () => void }

export default function EnvelopeAnimation({ lang, translations, onOpen }: Props) {
  const [opened, setOpened] = useState(false)
  const [animating, setAnimating] = useState(false)

  const handleOpen = () => {
    if (opened || animating) return
    setAnimating(true)
    onOpen?.()
    setTimeout(() => { setOpened(true); setAnimating(false) }, 1200)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {!opened ? (
        <div className="cursor-pointer select-none" onClick={handleOpen}>
          <div className="relative w-56 h-36 sm:w-72 sm:h-48">
            <div className="absolute inset-0 bg-[#f5f0e8] rounded-lg shadow-2xl border border-[#c9a84c]/30" />
            <div
              className={`absolute top-0 left-0 right-0 h-1/2 origin-top ${animating ? 'animate-envelope-flap' : ''}`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div
                className="w-full h-full bg-[#ede8de] rounded-t-lg border border-[#c9a84c]/20"
                style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}
              />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-11 h-11 rounded-full bg-[#4a0a0a] border-2 border-[#c9a84c]/60 flex items-center justify-center shadow-lg">
                <span className="font-script text-[#c9a84c] text-base">J♥R</span>
              </div>
            </div>
            <div className="absolute -bottom-1 -left-3 text-3xl opacity-80">🌹</div>
            <div className="absolute -bottom-1 -right-3 text-3xl opacity-80">🌸</div>
          </div>
          <p className="font-script text-xl text-[#c9a84c] text-center mt-3 animate-gold-shimmer">
            {translations.tapToOpen}
          </p>
        </div>
      ) : (
        <InvitationCard lang={lang} translations={translations} />
      )}
    </div>
  )
}
```

- [ ] **Step 3: Update `components/InvitationCard.tsx`**

```typescript
import type { Lang, Translations } from '@/lib/i18n'

interface Props { lang: Lang; translations: Translations; invitedDays?: '22+23' | '23' }

export default function InvitationCard({ translations, invitedDays }: Props) {
  const body = invitedDays === '22+23'
    ? translations.inviteBody22and23
    : translations.inviteBody23only

  return (
    <div className="animate-card-rise bg-[#f5f0e8] text-[#1a0a0a] rounded-2xl p-8 max-w-lg mx-auto text-center shadow-2xl border border-[#c9a84c]/40">
      <p className="font-script text-5xl text-[#4a0a0a] mb-4">{translations.inviteHeading}</p>
      <div className="w-16 h-px bg-[#c9a84c] mx-auto mb-4" />
      <p className="font-serif text-base leading-relaxed text-[#1a0a0a]/80 mb-6">{body}</p>
      <p className="font-script text-2xl text-[#4a0a0a]">{translations.inviteClosing}</p>
    </div>
  )
}
```

- [ ] **Step 4: Update `components/RsvpForm.tsx`**

```typescript
'use client'
import { useState } from 'react'
import type { Lang, Translations } from '@/lib/i18n'
import ConfettiCelebration from './ConfettiCelebration'

interface Props {
  token: string
  guestName: string
  invitedDays: '22+23' | '23'
  lang: Lang
  translations: Translations
  existingRsvp?: { attending22: boolean | null; attending23: boolean; note: string | null } | null
}

type Choice = 'yes' | 'no' | 'maybe' | null

export default function RsvpForm({ token, invitedDays, translations, existingRsvp }: Props) {
  const [choice22, setChoice22] = useState<Choice>(
    existingRsvp?.attending22 === true ? 'yes' : existingRsvp?.attending22 === false ? 'no' : null
  )
  const [choice23, setChoice23] = useState<Choice>(
    existingRsvp?.attending23 === true ? 'yes' : existingRsvp?.attending23 === false ? 'no' : null
  )
  const [note, setNote] = useState(existingRsvp?.note ?? '')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const choiceToBoolean = (c: Choice): boolean => c === 'yes' || c === 'maybe'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!choice23) return
    setLoading(true)
    await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        attending22: invitedDays === '22+23' ? choiceToBoolean(choice22) : undefined,
        attending23: choiceToBoolean(choice23),
        note: note || null,
      }),
    })
    setSubmitted(true)
    setLoading(false)
  }

  const ChoiceButtons = ({ value, onChange }: { value: Choice; onChange: (c: Choice) => void }) => (
    <div className="flex gap-3">
      {(['yes', 'no', 'maybe'] as const).map(c => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={`flex-1 py-2.5 rounded-lg font-serif text-sm border transition-all ${
            value === c
              ? 'bg-[#c9a84c] text-[#1a0a0a] border-[#c9a84c] font-semibold'
              : 'bg-transparent text-[#f5f0e8] border-[#c9a84c]/40 hover:border-[#c9a84c]'
          }`}
        >
          {c === 'yes' ? translations.rsvpYes : c === 'no' ? translations.rsvpNo : translations.rsvpMaybe}
        </button>
      ))}
    </div>
  )

  if (submitted) {
    return (
      <>
        <ConfettiCelebration />
        <div className="text-center py-12">
          <p className="font-script text-5xl text-[#c9a84c] mb-4">🎉</p>
          <p className="font-serif text-xl text-[#f5f0e8]">{translations.rsvpConfirmation}</p>
        </div>
      </>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-md mx-auto">
      <p className="font-serif text-[#f5f0e8]/80 text-center">{translations.rsvpQuestion}</p>

      {invitedDays === '22+23' && (
        <div className="bg-[#4a0a0a]/40 border border-[#c9a84c]/30 rounded-xl p-4">
          <p className="font-serif text-[#c9a84c] text-sm mb-3">{translations.inviteDate22}</p>
          <ChoiceButtons value={choice22} onChange={setChoice22} />
        </div>
      )}

      <div className="bg-[#4a0a0a]/40 border border-[#c9a84c]/30 rounded-xl p-4">
        <p className="font-serif text-[#c9a84c] text-sm mb-3">{translations.inviteDate23}</p>
        <ChoiceButtons value={choice23} onChange={setChoice23} />
      </div>

      <div>
        <label className="block font-serif text-sm text-[#f5f0e8]/60 mb-2">{translations.rsvpNote}</label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder={translations.rsvpNotePlaceholder}
          rows={3}
          className="w-full bg-[#4a0a0a]/40 border border-[#c9a84c]/30 rounded-xl px-4 py-3 text-[#f5f0e8] font-serif text-sm focus:outline-none focus:border-[#c9a84c] resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !choice23}
        className="bg-[#c9a84c] text-[#1a0a0a] font-serif font-semibold py-3 rounded-xl hover:bg-[#c9a84c]/80 transition-colors disabled:opacity-40"
      >
        {loading ? '...' : existingRsvp ? translations.rsvpUpdate : translations.rsvpSubmit}
      </button>
    </form>
  )
}
```

- [ ] **Step 5: Update `components/ScrollInvitation.tsx`**

Replace the entire file. Key changes: add `translations: Translations` to Props, remove the 3 hardcoded inline strings, pass `translations` to all child components.

```typescript
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
```

- [ ] **Step 6: Update `app/[lang]/invite/[token]/page.tsx`** to call `loadTranslations` and pass the prop

```typescript
import { readdirSync } from 'fs'
import { join } from 'path'
import type { Lang } from '@/lib/i18n'
import { loadTranslations } from '@/lib/i18n'
import ScrollInvitation from '@/components/ScrollInvitation'
import { db } from '@/lib/db'
import { guests, rsvps } from '@/lib/schema'
import { eq } from 'drizzle-orm'

interface Props { params: Promise<{ lang: string; token: string }> }

function getPhotoList(): string[] {
  try {
    const dir = join(process.cwd(), 'public', 'photos')
    return readdirSync(dir)
      .filter(f => /\.(jpe?g|png|webp)$/i.test(f) && f !== 'background.jpeg')
      .sort()
      .map(f => `/photos/${f}`)
  } catch {
    return []
  }
}

async function getGuest(token: string) {
  const rows = await db.select().from(guests).where(eq(guests.token, token)).limit(1)
  if (!rows.length) return null
  const rsvp = await db.select().from(rsvps).where(eq(rsvps.guestId, rows[0].id)).limit(1)
  return { guest: rows[0], rsvp: rsvp[0] ?? null }
}

export default async function InvitePage({ params }: Props) {
  const { lang: langParam, token } = await params
  const lang = (langParam === 'en' ? 'en' : 'de') as Lang
  const [data, translations] = await Promise.all([getGuest(token), loadTranslations(lang)])

  if (!data) {
    return (
      <main className="relative min-h-screen flex flex-col items-center justify-center px-8 text-center"
        style={{ background: 'radial-gradient(ellipse at 20% 20%, #5a1010 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, #2a0505 0%, transparent 60%), #3a0808' }}>
        <p className="font-script text-5xl text-[#c9a84c] mb-4">Julia & Ravi</p>
        <div className="w-16 h-px bg-[#c9a84c]/40 mb-6" />
        <p className="font-serif text-[#f5f0e8]/70 text-base max-w-xs leading-relaxed">
          {lang === 'de'
            ? 'Dieser Einladungslink ist leider ungültig. Bitte wende dich an Julia oder Ravi.'
            : 'This invitation link is invalid. Please contact Julia or Ravi.'}
        </p>
        <p className="font-script text-2xl text-[#c9a84c]/60 mt-6">♥</p>
      </main>
    )
  }

  const { guest, rsvp } = data

  return (
    <ScrollInvitation
      lang={lang}
      translations={translations}
      photos={getPhotoList()}
      guest={{
        name: guest.name,
        invitedDays: guest.invitedDays as '22+23' | '23',
        token,
      }}
      existingRsvp={rsvp}
    />
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add components/CountdownTimer.tsx components/EnvelopeAnimation.tsx \
        components/InvitationCard.tsx components/RsvpForm.tsx \
        components/ScrollInvitation.tsx \
        app/\[lang\]/invite/\[token\]/page.tsx
git commit -m "feat: thread translations prop through all invitation components"
```

---

## Task 5: Admin page — English labels + Content tab

**Files:**
- Modify: `app/admin/page.tsx`

**Interfaces:**
- Consumes: `GET /api/content` → `{ de: Record<string,string>, en: Record<string,string> }`, `POST /api/content`
- Consumes: `GUEST_FACING_KEYS` from `lib/i18n.ts` (for type-safe key iteration)
- Produces: Admin page with tab bar "Guests" | "Content"; Content tab has grouped textarea form per language, Reset to Defaults button, Save button with feedback.

**Key detail on groups:** The content editor groups keys visually for readability:

```
General:  coupleNames, saveTheDate, tapToOpen
Countdown: countdownDays, countdownHours, countdownMinutes, countdownSeconds
Invitation: inviteHeading, inviteBody22and23, inviteBody23only, inviteDate22, inviteDate23, inviteClosing, calendarLabel
No-guest closing: noGuestClosingBody, noGuestClosingSign
RSVP: rsvpGreeting, rsvpInvited22and23, rsvpInvited23only, rsvpQuestion, rsvpYes, rsvpNo, rsvpMaybe, rsvpNote, rsvpNotePlaceholder, rsvpSubmit, rsvpUpdate, rsvpConfirmation
```

- [ ] **Step 1: Replace `app/admin/page.tsx` with the full updated version**

```typescript
'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { translations as defaults, GUEST_FACING_KEYS, type Translations } from '@/lib/i18n'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Rsvp {
  attending22: boolean | null
  attending23: boolean
  note: string | null
}

interface Guest {
  id: string
  token: string
  name: string
  email: string | null
  phone: string | null
  invitedDays: string
  createdAt: string
  rsvp: Rsvp | null
}

type Tab = 'guests' | 'content'
type ContentState = { de: Record<string, string>; en: Record<string, string> }

// ── Content key groups for the editor UI ───────────────────────────────────────

const CONTENT_GROUPS: { label: string; keys: (keyof Translations)[] }[] = [
  {
    label: 'General',
    keys: ['coupleNames', 'saveTheDate', 'tapToOpen'],
  },
  {
    label: 'Countdown labels',
    keys: ['countdownDays', 'countdownHours', 'countdownMinutes', 'countdownSeconds'],
  },
  {
    label: 'Invitation',
    keys: ['inviteHeading', 'inviteBody22and23', 'inviteBody23only', 'inviteDate22', 'inviteDate23', 'inviteClosing', 'calendarLabel'],
  },
  {
    label: 'No-guest closing (shown when link has no token)',
    keys: ['noGuestClosingBody', 'noGuestClosingSign'],
  },
  {
    label: 'RSVP',
    keys: ['rsvpGreeting', 'rsvpInvited22and23', 'rsvpInvited23only', 'rsvpQuestion', 'rsvpYes', 'rsvpNo', 'rsvpMaybe', 'rsvpNote', 'rsvpNotePlaceholder', 'rsvpSubmit', 'rsvpUpdate', 'rsvpConfirmation'],
  },
]

// ── Human-readable labels for each key ────────────────────────────────────────

const KEY_LABELS: Partial<Record<keyof Translations, string>> = {
  coupleNames: 'Couple names',
  saveTheDate: '"Save the Date" label',
  tapToOpen: '"Tap to open" envelope text',
  countdownDays: 'Days label',
  countdownHours: 'Hours label',
  countdownMinutes: 'Minutes label',
  countdownSeconds: 'Seconds label',
  inviteHeading: 'Main heading ("We\'re saying yes!")',
  inviteBody22and23: 'Invitation body — guests invited to both days',
  inviteBody23only: 'Invitation body — guests invited to celebration only',
  inviteDate22: 'Date line — wedding day (22 Jan)',
  inviteDate23: 'Date line — celebration day (23 Jan)',
  inviteClosing: 'Closing sign-off',
  calendarLabel: 'Calendar section header ("Mark your calendar")',
  noGuestClosingBody: 'Closing paragraph (shown when no guest token in URL)',
  noGuestClosingSign: 'Closing sign (shown when no guest token in URL)',
  rsvpGreeting: 'RSVP greeting prefix ("Dear")',
  rsvpInvited22and23: 'RSVP — invited to both days line',
  rsvpInvited23only: 'RSVP — invited to celebration only line',
  rsvpQuestion: 'RSVP question ("Will you be joining us?")',
  rsvpYes: 'RSVP Yes button',
  rsvpNo: 'RSVP No button',
  rsvpMaybe: 'RSVP Maybe button',
  rsvpNote: 'Note field label',
  rsvpNotePlaceholder: 'Note field placeholder',
  rsvpSubmit: 'Submit button',
  rsvpUpdate: 'Update button (when re-submitting)',
  rsvpConfirmation: 'Confirmation message after submit',
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function defaultContent(): ContentState {
  return {
    de: Object.fromEntries(GUEST_FACING_KEYS.map(k => [k, defaults.de[k]])),
    en: Object.fromEntries(GUEST_FACING_KEYS.map(k => [k, defaults.en[k]])),
  }
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('guests')

  // Guests tab state
  const [guests, setGuests] = useState<Guest[]>([])
  const [copied, setCopied] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Content tab state
  const [content, setContent] = useState<ContentState>(defaultContent())
  const [contentLoading, setContentLoading] = useState(false)
  const [savingContent, setSavingContent] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')

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

  const exportCsv = () => {
    const header = 'Name,Email,Phone,Invited Days,RSVP 22,RSVP 23,Note,Token,Link DE,Link EN'
    const rows = guests.map(g => {
      const base = window.location.origin
      const r = g.rsvp
      return `"${g.name}","${g.email ?? ''}","${g.phone ?? ''}","${g.invitedDays}","${r ? (r.attending22 === null ? '?' : r.attending22 ? 'Yes' : 'No') : ''}","${r ? (r.attending23 ? 'Yes' : 'No') : ''}","${r?.note ?? ''}","${g.token}","${base}/de/invite/${g.token}","${base}/en/invite/${g.token}"`
    })
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'guests.csv'; a.click()
  }

  const printPdf = () => {
    const base = window.location.origin
    const rows = guests.map(g => {
      const r = g.rsvp
      const rsvp22 = g.invitedDays === '22+23' ? (r ? (r.attending22 === null ? '?' : r.attending22 ? '✓' : '✗') : '–') : '—'
      const rsvp23 = r ? (r.attending23 ? '✓' : '✗') : '–'
      return `<tr>
        <td>${g.name}</td>
        <td>${g.email ?? g.phone ?? '—'}</td>
        <td>${g.invitedDays === '22+23' ? '22 + 23 Jan' : '23 Jan'}</td>
        <td style="text-align:center">${rsvp22}</td>
        <td style="text-align:center">${rsvp23}</td>
        <td>${r?.note ?? ''}</td>
        <td style="font-size:10px">${base}/de/invite/${g.token}</td>
      </tr>`
    }).join('')
    const html = `<!DOCTYPE html><html><head><title>Julia & Ravi — Guest List</title>
    <style>body{font-family:Georgia,serif;padding:24px}h1{font-size:22px;margin-bottom:4px;color:#3a0808}p{font-size:12px;color:#666;margin-bottom:16px}
    table{width:100%;border-collapse:collapse;font-size:12px}th{background:#3a0808;color:#c9a84c;padding:6px 8px;text-align:left}
    td{padding:5px 8px;border-bottom:1px solid #ddd}tr:nth-child(even) td{background:#fdf8f0}
    @media print{button{display:none}}</style></head>
    <body><h1>Julia & Ravi — Guest List</h1><p>Wedding 22 Jan & Celebration 23 Jan 2027 · Berlin · ${guests.length} guests</p>
    <table><thead><tr><th>Name</th><th>Contact</th><th>Invited</th><th>RSVP 22</th><th>RSVP 23</th><th>Note</th><th>Link</th></tr></thead>
    <tbody>${rows}</tbody></table></body></html>`
    const w = window.open('', '_blank')!
    w.document.write(html); w.document.close(); w.print()
  }

  const confirmed = guests.filter(g => g.rsvp?.attending23).length
  const declined = guests.filter(g => g.rsvp && !g.rsvp.attending23).length
  const pending = guests.filter(g => !g.rsvp).length

  // ── Content tab logic ───────────────────────────────────────────────────────

  useEffect(() => {
    if (tab !== 'content') return
    setContentLoading(true)
    fetch('/api/content')
      .then(r => r.json())
      .then((d: ContentState) => setContent(d))
      .catch(() => {/* keep defaults */})
      .finally(() => setContentLoading(false))
  }, [tab])

  const handleContentChange = (lang: 'de' | 'en', key: string, value: string) => {
    setContent(prev => ({ ...prev, [lang]: { ...prev[lang], [key]: value } }))
  }

  const handleSaveContent = async () => {
    setSavingContent(true)
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      })
      setSaveStatus(res.ok ? 'saved' : 'error')
    } catch {
      setSaveStatus('error')
    }
    setSavingContent(false)
    setTimeout(() => setSaveStatus('idle'), 3000)
  }

  const handleResetDefaults = () => {
    if (!confirm('Reset all text to built-in defaults? This does not save — click Save to persist.')) return
    setContent(defaultContent())
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen text-[#f5f0e8] p-6 relative"
      style={{ backgroundImage: 'url(/photos/rose/roses.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />
      <div className="relative z-10 max-w-7xl mx-auto">

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
            <Link href="/admin/create"
              className="bg-[#c9a84c] text-[#1a0a0a] px-4 py-2 rounded-lg font-serif text-sm font-semibold hover:bg-[#e0bd6e] transition-colors">
              + Add Guest
            </Link>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mb-6 bg-black/30 rounded-xl p-1 w-fit">
          {(['guests', 'content'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg font-serif text-sm transition-all ${
                tab === t
                  ? 'bg-[#c9a84c] text-[#1a0a0a] font-semibold'
                  : 'text-[#f5f0e8]/60 hover:text-[#f5f0e8]'
              }`}
            >
              {t === 'guests' ? 'Guests' : 'Content'}
            </button>
          ))}
        </div>

        {/* ── Guests tab ── */}
        {tab === 'guests' && (
          <>
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

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-white/20 shadow-2xl bg-white/10 backdrop-blur-md">
              <table className="w-full font-serif text-sm">
                <thead>
                  <tr className="bg-black/30 text-[#c9a84c] text-xs uppercase tracking-wider">
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Contact</th>
                    <th className="px-4 py-3 text-left">Invited</th>
                    <th className="px-4 py-3 text-center">RSVP 22</th>
                    <th className="px-4 py-3 text-center">RSVP 23</th>
                    <th className="px-4 py-3 text-left">Note</th>
                    <th className="px-4 py-3 text-left">Links</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {guests.map((g, i) => {
                    const base = typeof window !== 'undefined' ? window.location.origin : ''
                    const linkDe = `${base}/de/invite/${g.token}`
                    const linkEn = `${base}/en/invite/${g.token}`
                    const r = g.rsvp
                    const rsvpColor = (v: boolean | null | undefined) =>
                      v === true ? 'text-green-400' : v === false ? 'text-red-400' : 'text-[#f5f0e8]/30'
                    return (
                      <tr key={g.id}
                        className={`border-t border-white/10 transition-colors hover:bg-white/10 ${i % 2 === 0 ? 'bg-transparent' : 'bg-white/5'}`}>
                        <td className="px-4 py-3 text-[#f5f0e8] font-medium">{g.name}</td>
                        <td className="px-4 py-3 text-[#f5f0e8]/60 text-xs">{g.email ?? g.phone ?? '—'}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-xs bg-[#c9a84c]/15 text-[#c9a84c] border border-[#c9a84c]/30">
                            {g.invitedDays === '22+23' ? '22 + 23 Jan' : '23 Jan'}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-center text-base ${rsvpColor(r?.attending22)}`}>
                          {g.invitedDays === '22+23'
                            ? (r ? (r.attending22 === null ? '?' : r.attending22 ? '✓' : '✗') : '–')
                            : <span className="text-xs text-[#f5f0e8]/20">—</span>}
                        </td>
                        <td className={`px-4 py-3 text-center text-base ${rsvpColor(r?.attending23)}`}>
                          {r ? (r.attending23 ? '✓' : '✗') : '–'}
                        </td>
                        <td className="px-4 py-3 text-[#f5f0e8]/60 text-xs max-w-[140px] truncate">{r?.note ?? ''}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button onClick={() => copyLink(linkDe, `de-${g.id}`)}
                              className="text-xs bg-black/30 border border-[#c9a84c]/40 px-2 py-1 rounded hover:border-[#c9a84c] transition-colors text-[#c9a84c]">
                              {copied === `de-${g.id}` ? '✓' : 'DE'}
                            </button>
                            <button onClick={() => copyLink(linkEn, `en-${g.id}`)}
                              className="text-xs bg-black/30 border border-[#c9a84c]/40 px-2 py-1 rounded hover:border-[#c9a84c] transition-colors text-[#c9a84c]">
                              {copied === `en-${g.id}` ? '✓' : 'EN'}
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => deleteGuest(g.id, g.name)}
                            disabled={deleting === g.id}
                            className="text-xs text-red-400/50 hover:text-red-400 transition-colors disabled:opacity-30 text-base">
                            {deleting === g.id ? '…' : '✕'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                  {guests.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-[#f5f0e8]/30 font-serif">
                        No guests added yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── Content tab ── */}
        {tab === 'content' && (
          <div className="max-w-5xl">
            {contentLoading ? (
              <p className="font-serif text-[#f5f0e8]/40 py-12 text-center">Loading…</p>
            ) : (
              <>
                <p className="font-serif text-[#f5f0e8]/50 text-sm mb-6">
                  Edit guest-facing invitation text in both languages. Changes take effect immediately after saving.
                </p>

                {CONTENT_GROUPS.map(group => (
                  <div key={group.label} className="mb-8">
                    <h2 className="font-serif text-[#c9a84c] text-xs uppercase tracking-widest mb-4 border-b border-[#c9a84c]/20 pb-2">
                      {group.label}
                    </h2>
                    <div className="flex flex-col gap-4">
                      {group.keys.map(key => (
                        <div key={key} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
                          <p className="font-serif text-[#f5f0e8]/60 text-xs mb-3">
                            {KEY_LABELS[key] ?? key}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {(['de', 'en'] as const).map(lang => (
                              <div key={lang}>
                                <label className="block text-[#c9a84c]/70 text-xs font-serif mb-1 uppercase tracking-wider">
                                  {lang === 'de' ? 'German' : 'English'}
                                </label>
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
                      ))}
                    </div>
                  </div>
                ))}

                {/* Action bar */}
                <div className="flex items-center gap-4 pt-4 pb-8 sticky bottom-0 bg-gradient-to-t from-black/60 to-transparent">
                  <button
                    onClick={handleSaveContent}
                    disabled={savingContent}
                    className="bg-[#c9a84c] text-[#1a0a0a] font-serif font-semibold px-6 py-2.5 rounded-xl hover:bg-[#e0bd6e] transition-colors disabled:opacity-40"
                  >
                    {savingContent ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    onClick={handleResetDefaults}
                    className="border border-[#c9a84c]/40 text-[#c9a84c] font-serif text-sm px-4 py-2.5 rounded-xl hover:bg-[#c9a84c]/10 transition-colors"
                  >
                    Reset to defaults
                  </button>
                  {saveStatus === 'saved' && (
                    <span className="font-serif text-green-400 text-sm">Saved ✓</span>
                  )}
                  {saveStatus === 'error' && (
                    <span className="font-serif text-red-400 text-sm">Save failed — try again</span>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/admin/page.tsx
git commit -m "feat: admin page — English labels, Guests/Content tab, content editor"
```

---

## Self-Review Checklist

**Spec coverage:**
- ✅ All guest-facing text extracted and editable (29 keys × 2 langs)
- ✅ 3 previously hardcoded inline strings now have i18n keys (`calendarLabel`, `noGuestClosingBody`, `noGuestClosingSign`)
- ✅ DB-backed — `content` table with upsert
- ✅ Defaults seeded on first Save (form pre-populated from static defaults; Save writes all rows)
- ✅ Admin-only access on both API routes
- ✅ Admin page entirely in English
- ✅ Tab UI: Guests | Content
- ✅ Reset to defaults button (no DB call, just re-populates form)
- ✅ Save feedback (Saved ✓ / Save failed)
- ✅ `loadTranslations()` falls back to static defaults on DB error
- ✅ No new npm dependencies
- ✅ `t()` backward-compatible

**Placeholder scan:** None found — all code is complete.

**Type consistency:**
- `loadTranslations(lang: Lang): Promise<Translations>` defined in Task 2, consumed in Task 4 ✅
- `translations: Translations` prop name consistent across all components ✅
- `GUEST_FACING_KEYS` exported in Task 2, consumed in Tasks 3 + 5 ✅
- `content` table exported in Task 1, consumed in Tasks 2 + 3 ✅
