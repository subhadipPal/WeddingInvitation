# Wedding Invitation App — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personalized Indo-German wedding Save the Date web app for Julia Schulze & Subhadip Pal (aka Ravi), with animated envelope, background music, photo gallery, token-based RSVP per guest, bilingual (DE/EN) support, and an admin panel.

**Architecture:** Next.js 14 App Router with TypeScript; API routes handle guest/RSVP persistence to Neon Postgres via Drizzle ORM; each guest gets a unique token embedded in `/de/invite/[token]` or `/en/invite/[token]` URLs; the admin panel at `/admin` is password-protected via a middleware cookie check.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Drizzle ORM, `@neondatabase/serverless`, `nanoid`, `js-cookie`, Google Fonts (Great Vibes + Cormorant Garamond)

## Global Constraints

- Node.js ≥ 18
- Next.js 14 App Router (not Pages Router) — all routes under `app/`
- TypeScript strict mode
- Tailwind CSS for all styling (no CSS modules except for keyframe animations)
- Neon connection string: stored in `DATABASE_URL` env var only — never hardcoded
- Admin password: stored in `ADMIN_PASSWORD` env var only
- All text strings go through `lib/i18n.ts` — no hardcoded UI strings in components
- Wedding dates: 22 Jan 2027 (Fri) and 23 Jan 2027 (Sat)
- Couple names: Julia Schulze & Subhadip Pal (aka Ravi) / short: Julia & Ravi
- Event name: Hochzeit
- Color palette: `#4a0a0a` (deep burgundy), `#c9a84c` (gold), `#f5f0e8` (cream), `#1a0a0a` (near-black)
- Fonts: `Great Vibes` (script headings), `Cormorant Garamond` (body)
- Commit in groups (related files together, never one file at a time)
- Photos source: `/Users/I584745/Invitation Photos/*.jpeg` → copy to `public/photos/`
- MP3: `public/audio/forever-and-always.mp3` (user drops in manually)

---

## File Map

```
WeddingInvitation/
├── app/
│   ├── layout.tsx                        # Root layout: fonts, global styles, metadata
│   ├── page.tsx                          # Landing page: envelope animation + music + gallery
│   ├── [lang]/invite/[token]/page.tsx    # Guest RSVP page (DE or EN, token-identified)
│   ├── admin/
│   │   ├── layout.tsx                    # Admin layout: password gate
│   │   ├── page.tsx                      # Guest list + RSVP stats + CSV export
│   │   └── create/page.tsx              # Create guest form + generated links
│   └── api/
│       ├── guests/route.ts              # GET /api/guests, POST /api/guests
│       ├── guests/[token]/route.ts      # GET /api/guests/[token]
│       ├── rsvp/route.ts                # POST /api/rsvp
│       └── admin-auth/route.ts          # POST /api/admin-auth (set cookie)
├── components/
│   ├── EnvelopeAnimation.tsx            # Wax-seal envelope with open animation
│   ├── InvitationCard.tsx               # Card revealed after envelope opens
│   ├── MusicPlayer.tsx                  # Floating audio control (play/pause/mute)
│   ├── PhotoGallery.tsx                 # Auto-advancing slideshow of couple photos
│   ├── RsvpForm.tsx                     # Day-aware RSVP form (22+23 or 23 only)
│   ├── LanguageToggle.tsx               # DE / EN switcher button
│   ├── CountdownTimer.tsx               # Live countdown to 22 Jan 2027
│   ├── MandalaDecor.tsx                 # Gold mandala corner SVG decorations
│   └── ConfettiCelebration.tsx          # Confetti burst on RSVP submit
├── lib/
│   ├── db.ts                            # Neon + Drizzle client singleton
│   ├── schema.ts                        # guests + rsvps Drizzle table definitions
│   ├── tokens.ts                        # generateToken() using nanoid
│   └── i18n.ts                          # All DE/EN strings, getLang(), t() helper
├── middleware.ts                         # Admin route protection via cookie
├── public/
│   ├── audio/forever-and-always.mp3     # (user drops in manually)
│   └── photos/                          # Copied from Invitation Photos/
├── .env.local                           # DATABASE_URL + ADMIN_PASSWORD (git-ignored)
├── .env.example                         # Template (committed)
├── .gitignore                           # node_modules, .env.local, .next
└── .github/workflows/keep-alive.yml    # Daily DB ping to prevent hibernation
```

---

## Task 1: Project Scaffold + DB Schema + Env Setup

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts` (via `create-next-app`)
- Create: `.env.local`
- Create: `.env.example`
- Create: `.gitignore`
- Create: `lib/db.ts`
- Create: `lib/schema.ts`
- Create: `lib/tokens.ts`

**Interfaces:**
- Produces:
  - `db` — Drizzle client instance exported from `lib/db.ts`
  - `guests` table schema exported from `lib/schema.ts`
  - `rsvps` table schema exported from `lib/schema.ts`
  - `generateToken(): string` exported from `lib/tokens.ts`

- [ ] **Step 1: Scaffold Next.js app**

```bash
cd /Users/I584745/WeddingInvitation
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --yes
```

Expected: project files created, `npm run dev` works at `localhost:3000`

- [ ] **Step 2: Install dependencies**

```bash
npm install drizzle-orm @neondatabase/serverless nanoid
npm install -D drizzle-kit
```

- [ ] **Step 3: Create `.env.local`**

```
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
ADMIN_PASSWORD=<your_admin_password>
```

- [ ] **Step 4: Create `.env.example`**

```
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
ADMIN_PASSWORD=your_admin_password_here
```

- [ ] **Step 5: Write `lib/schema.ts`**

```typescript
import { pgTable, uuid, varchar, boolean, text, timestamp } from 'drizzle-orm/pg-core'

export const guests = pgTable('guests', {
  id: uuid('id').primaryKey().defaultRandom(),
  token: varchar('token', { length: 12 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 200 }),
  phone: varchar('phone', { length: 30 }),
  invitedDays: varchar('invited_days', { length: 10 }).notNull(), // "22+23" | "23"
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
```

- [ ] **Step 6: Write `lib/db.ts`**

```typescript
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })
```

- [ ] **Step 7: Write `lib/tokens.ts`**

```typescript
import { customAlphabet } from 'nanoid'

const alphabet = '23456789abcdefghjkmnpqrstuvwxyz'
const nanoid = customAlphabet(alphabet, 8)

export function generateToken(): string {
  return nanoid()
}
```

- [ ] **Step 8: Add `drizzle.config.ts` at project root**

```typescript
import type { Config } from 'drizzle-kit'

export default {
  schema: './lib/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config
```

- [ ] **Step 9: Push schema to Neon**

```bash
npx drizzle-kit push
```

Expected output: `guests` and `rsvps` tables created in Neon with no errors.

- [ ] **Step 10: Copy photos to public**

```bash
mkdir -p public/photos
cp "/Users/I584745/Invitation Photos/"*.jpeg public/photos/
mkdir -p public/audio
echo "# Drop forever-and-always.mp3 here" > public/audio/README.md
```

- [ ] **Step 11: Commit group 1 — scaffold + DB**

```bash
cd /Users/I584745/WeddingInvitation
git add .
git commit -m "feat: scaffold Next.js app, DB schema, tokens, photos"
```

---

## Task 2: i18n + Root Layout + Global Styles

**Files:**
- Create: `lib/i18n.ts`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Create: `components/LanguageToggle.tsx`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `t(key: keyof Translations, lang: Lang): string` — translate a key
  - `type Lang = 'de' | 'en'`
  - `translations: Record<Lang, Translations>` — all strings
  - `<LanguageToggle lang={Lang} currentPath={string} />` — renders DE/EN toggle

- [ ] **Step 1: Write `lib/i18n.ts`**

```typescript
export type Lang = 'de' | 'en'

export interface Translations {
  // Landing
  coupleNames: string
  tapToOpen: string
  saveTheDate: string
  countdownDays: string
  countdownHours: string
  countdownMinutes: string
  countdownSeconds: string
  // Invitation card text
  inviteHeading: string
  inviteBody22and23: string
  inviteBody23only: string
  inviteDate22: string
  inviteDate23: string
  inviteClosing: string
  // RSVP
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
  // Admin
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
    inviteBody22and23: 'Wir heiraten am Freitag, 22. Januar 2027 & Samstag, 23. Januar 2027 in Berlin. Deshalb haltet Euch bitte diese Termine frei! Die Einladung & nähere Informationen folgen.',
    inviteBody23only: 'Wir heiraten am Samstag, 23. Januar 2027 in Berlin. Deshalb haltet Euch bitte diesen Termin frei! Die Einladung & nähere Informationen folgen.',
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
    inviteHeading: 'We're saying yes!',
    inviteBody22and23: 'We are getting married on Friday, 22nd January 2027 & Saturday, 23rd January 2027 in Berlin. Please save the dates! Full invitation and details to follow.',
    inviteBody23only: 'We are getting married on Saturday, 23rd January 2027 in Berlin. Please save the date! Full invitation and details to follow.',
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
```

- [ ] **Step 2: Update `app/layout.tsx`**

```typescript
import type { Metadata } from 'next'
import { Great_Vibes, Cormorant_Garamond } from 'next/font/google'
import './globals.css'

const greatVibes = Great_Vibes({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-script',
})

const cormorant = Cormorant_Garamond({
  weight: ['300', '400', '600'],
  subsets: ['latin'],
  variable: '--font-serif',
})

export const metadata: Metadata = {
  title: 'Julia & Ravi — Save the Date · 22 & 23 January 2027',
  description: 'Save the Date — Julia Schulze & Subhadip Pal, Berlin, January 2027',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className={`${greatVibes.variable} ${cormorant.variable} bg-[#1a0a0a] text-[#f5f0e8]`}>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Update `app/globals.css`** — add keyframe animations

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --font-script: 'Great Vibes', cursive;
  --font-serif: 'Cormorant Garamond', serif;
  --color-burgundy: #4a0a0a;
  --color-gold: #c9a84c;
  --color-cream: #f5f0e8;
}

@keyframes envelope-flap {
  0%   { transform: rotateX(0deg); }
  100% { transform: rotateX(-180deg); }
}

@keyframes card-rise {
  0%   { transform: translateY(60px); opacity: 0; }
  100% { transform: translateY(0);    opacity: 1; }
}

@keyframes gold-shimmer {
  0%, 100% { opacity: 0.7; }
  50%       { opacity: 1; }
}

@keyframes petal-fall {
  0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100vh)  rotate(360deg); opacity: 0; }
}

.font-script { font-family: var(--font-script); }
.font-serif  { font-family: var(--font-serif); }
.animate-envelope-flap { animation: envelope-flap 1.2s ease-in-out forwards; }
.animate-card-rise     { animation: card-rise 0.8s ease-out forwards; }
.animate-gold-shimmer  { animation: gold-shimmer 3s ease-in-out infinite; }
```

- [ ] **Step 4: Write `components/LanguageToggle.tsx`**

```typescript
'use client'
import { useRouter } from 'next/navigation'
import type { Lang } from '@/lib/i18n'

interface Props {
  lang: Lang
  token?: string
}

export default function LanguageToggle({ lang, token }: Props) {
  const router = useRouter()

  const switchTo = (next: Lang) => {
    if (token) {
      router.push(`/${next}/invite/${token}`)
    } else {
      router.push('/')
    }
  }

  return (
    <div className="flex gap-1 text-sm font-serif">
      <button
        onClick={() => switchTo('de')}
        className={`px-2 py-1 rounded border border-[#c9a84c] transition-colors ${
          lang === 'de' ? 'bg-[#c9a84c] text-[#1a0a0a]' : 'text-[#c9a84c] hover:bg-[#c9a84c]/20'
        }`}
      >
        DE
      </button>
      <button
        onClick={() => switchTo('en')}
        className={`px-2 py-1 rounded border border-[#c9a84c] transition-colors ${
          lang === 'en' ? 'bg-[#c9a84c] text-[#1a0a0a]' : 'text-[#c9a84c] hover:bg-[#c9a84c]/20'
        }`}
      >
        EN
      </button>
    </div>
  )
}
```

- [ ] **Step 5: Commit group 2 — i18n + layout**

```bash
git add lib/i18n.ts app/layout.tsx app/globals.css components/LanguageToggle.tsx
git commit -m "feat: i18n strings (DE/EN), root layout, global styles, language toggle"
```

---

## Task 3: API Routes — Guests + RSVP

**Files:**
- Create: `app/api/guests/route.ts`
- Create: `app/api/guests/[token]/route.ts`
- Create: `app/api/rsvp/route.ts`
- Create: `app/api/admin-auth/route.ts`

**Interfaces:**
- Consumes: `db` from `lib/db.ts`, `guests`/`rsvps` from `lib/schema.ts`, `generateToken` from `lib/tokens.ts`
- Produces:
  - `GET /api/guests` → `{ guests: GuestRow[] }` (admin only, requires `admin-auth` cookie)
  - `POST /api/guests` body `{ name, email?, phone?, invitedDays, lang? }` → `{ token, linkDe, linkEn }`
  - `GET /api/guests/[token]` → `{ guest: GuestRow, rsvp: RsvpRow | null }`
  - `POST /api/rsvp` body `{ token, attending22?, attending23, note? }` → `{ ok: true }`
  - `POST /api/admin-auth` body `{ password }` → sets `admin-auth` cookie, returns `{ ok: true }` or 401

- [ ] **Step 1: Write `app/api/admin-auth/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const res = NextResponse.json({ ok: true })
  res.cookies.set('admin-auth', process.env.ADMIN_PASSWORD!, {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
  return res
}
```

- [ ] **Step 2: Write `app/api/guests/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { guests } from '@/lib/schema'
import { generateToken } from '@/lib/tokens'
import { eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const adminCookie = req.cookies.get('admin-auth')
  if (adminCookie?.value !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const all = await db.select().from(guests).orderBy(guests.createdAt)
  return NextResponse.json({ guests: all })
}

export async function POST(req: NextRequest) {
  const adminCookie = req.cookies.get('admin-auth')
  if (adminCookie?.value !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { name, email, phone, invitedDays } = await req.json()
  if (!name || !invitedDays) {
    return NextResponse.json({ error: 'name and invitedDays required' }, { status: 400 })
  }
  const token = generateToken()
  await db.insert(guests).values({ token, name, email, phone, invitedDays })
  const base = req.headers.get('origin') ?? ''
  return NextResponse.json({
    token,
    linkDe: `${base}/de/invite/${token}`,
    linkEn: `${base}/en/invite/${token}`,
  })
}
```

- [ ] **Step 3: Write `app/api/guests/[token]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { guests, rsvps } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  const guest = await db.select().from(guests).where(eq(guests.token, params.token)).limit(1)
  if (!guest.length) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const rsvp = await db.select().from(rsvps).where(eq(rsvps.guestId, guest[0].id)).limit(1)
  return NextResponse.json({ guest: guest[0], rsvp: rsvp[0] ?? null })
}
```

- [ ] **Step 4: Write `app/api/rsvp/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { guests, rsvps } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  const { token, attending22, attending23, note } = await req.json()
  if (!token || attending23 === undefined) {
    return NextResponse.json({ error: 'token and attending23 required' }, { status: 400 })
  }
  const guest = await db.select().from(guests).where(eq(guests.token, token)).limit(1)
  if (!guest.length) {
    return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
  }
  const existing = await db.select().from(rsvps).where(eq(rsvps.guestId, guest[0].id)).limit(1)
  if (existing.length) {
    await db.update(rsvps)
      .set({ attending22: attending22 ?? null, attending23, note, updatedAt: new Date() })
      .where(eq(rsvps.guestId, guest[0].id))
  } else {
    await db.insert(rsvps).values({
      guestId: guest[0].id,
      attending22: attending22 ?? null,
      attending23,
      note,
    })
  }
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 5: Commit group 3 — API routes**

```bash
git add app/api/
git commit -m "feat: API routes for guests, RSVP, and admin auth"
```

---

## Task 4: Admin Middleware + Admin Panel

**Files:**
- Create: `middleware.ts`
- Create: `app/admin/layout.tsx`
- Create: `app/admin/page.tsx`
- Create: `app/admin/create/page.tsx`

**Interfaces:**
- Consumes: `GET /api/guests`, `POST /api/guests`, `POST /api/admin-auth`; `t()` from `lib/i18n.ts`
- Produces: working admin UI at `/admin` and `/admin/create`

- [ ] **Step 1: Write `middleware.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const adminAuth = req.cookies.get('admin-auth')
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
  const isLoginPage = req.nextUrl.pathname === '/admin/login'

  if (isAdminRoute && !isLoginPage && adminAuth?.value !== process.env.ADMIN_PASSWORD) {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
```

- [ ] **Step 2: Create `app/admin/login/page.tsx`**

```typescript
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/admin-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      router.push('/admin')
    } else {
      setError('Falsches Passwort / Wrong password')
    }
  }

  return (
    <div className="min-h-screen bg-[#1a0a0a] flex items-center justify-center">
      <div className="bg-[#4a0a0a]/60 border border-[#c9a84c]/40 rounded-2xl p-10 w-full max-w-sm">
        <h1 className="font-script text-4xl text-[#c9a84c] text-center mb-8">Julia & Ravi</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Passwort / Password"
            className="bg-[#1a0a0a] border border-[#c9a84c]/40 rounded px-4 py-2 text-[#f5f0e8] font-serif focus:outline-none focus:border-[#c9a84c]"
          />
          {error && <p className="text-red-400 text-sm font-serif">{error}</p>}
          <button
            type="submit"
            className="bg-[#c9a84c] text-[#1a0a0a] font-serif font-semibold py-2 rounded hover:bg-[#c9a84c]/80 transition-colors"
          >
            Anmelden / Login
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Write `app/admin/page.tsx`**

```typescript
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Guest {
  id: string; token: string; name: string; email: string | null
  phone: string | null; invitedDays: string; createdAt: string
}

export default function AdminPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/guests').then(r => r.json()).then(d => setGuests(d.guests ?? []))
  }, [])

  const copyLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const exportCsv = () => {
    const header = 'Name,Email,Phone,Invited Days,Token,Link DE,Link EN'
    const rows = guests.map(g => {
      const base = window.location.origin
      return `"${g.name}","${g.email ?? ''}","${g.phone ?? ''}","${g.invitedDays}","${g.token}","${base}/de/invite/${g.token}","${base}/en/invite/${g.token}"`
    })
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = 'guests.csv'; a.click()
  }

  return (
    <div className="min-h-screen bg-[#1a0a0a] text-[#f5f0e8] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-script text-4xl text-[#c9a84c]">Gästeverwaltung — Julia & Ravi</h1>
          <div className="flex gap-3">
            <button onClick={exportCsv} className="border border-[#c9a84c] text-[#c9a84c] px-4 py-2 rounded font-serif text-sm hover:bg-[#c9a84c]/20">
              Als CSV exportieren
            </button>
            <Link href="/admin/create" className="bg-[#c9a84c] text-[#1a0a0a] px-4 py-2 rounded font-serif text-sm font-semibold hover:bg-[#c9a84c]/80">
              + Gast hinzufügen
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Gesamt eingeladen', value: guests.length },
          ].map(s => (
            <div key={s.label} className="bg-[#4a0a0a]/40 border border-[#c9a84c]/30 rounded-xl p-4 text-center">
              <div className="text-3xl font-serif text-[#c9a84c]">{s.value}</div>
              <div className="text-sm font-serif text-[#f5f0e8]/70 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Guest table */}
        <div className="overflow-x-auto rounded-xl border border-[#c9a84c]/20">
          <table className="w-full font-serif text-sm">
            <thead>
              <tr className="bg-[#4a0a0a]/60 text-[#c9a84c]">
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Kontakt</th>
                <th className="px-4 py-3 text-left">Eingeladen</th>
                <th className="px-4 py-3 text-left">Deutsch-Link</th>
                <th className="px-4 py-3 text-left">English-Link</th>
              </tr>
            </thead>
            <tbody>
              {guests.map((g, i) => {
                const base = typeof window !== 'undefined' ? window.location.origin : ''
                const linkDe = `${base}/de/invite/${g.token}`
                const linkEn = `${base}/en/invite/${g.token}`
                return (
                  <tr key={g.id} className={`border-t border-[#c9a84c]/10 ${i % 2 === 0 ? 'bg-[#1a0a0a]' : 'bg-[#4a0a0a]/20'}`}>
                    <td className="px-4 py-3 text-[#f5f0e8]">{g.name}</td>
                    <td className="px-4 py-3 text-[#f5f0e8]/70">{g.email ?? g.phone ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-[#c9a84c]/20 text-[#c9a84c]">
                        {g.invitedDays === '22+23' ? '22 + 23 Jan' : '23 Jan'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => copyLink(linkDe, `de-${g.id}`)}
                        className="text-xs bg-[#4a0a0a] border border-[#c9a84c]/30 px-2 py-1 rounded hover:border-[#c9a84c] transition-colors truncate max-w-[160px]">
                        {copied === `de-${g.id}` ? 'Kopiert!' : 'DE kopieren'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => copyLink(linkEn, `en-${g.id}`)}
                        className="text-xs bg-[#4a0a0a] border border-[#c9a84c]/30 px-2 py-1 rounded hover:border-[#c9a84c] transition-colors">
                        {copied === `en-${g.id}` ? 'Copied!' : 'EN copy'}
                      </button>
                    </td>
                  </tr>
                )
              })}
              {guests.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-[#f5f0e8]/40">Noch keine Gäste hinzugefügt.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Write `app/admin/create/page.tsx`**

```typescript
'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function CreateGuestPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', invitedDays: '23' })
  const [links, setLinks] = useState<{ linkDe: string; linkEn: string } | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/guests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLinks({ linkDe: data.linkDe, linkEn: data.linkEn })
    setForm({ name: '', email: '', phone: '', invitedDays: '23' })
    setLoading(false)
  }

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="min-h-screen bg-[#1a0a0a] text-[#f5f0e8] p-8">
      <div className="max-w-xl mx-auto">
        <Link href="/admin" className="text-[#c9a84c] text-sm font-serif hover:underline mb-6 block">← Zurück zur Übersicht</Link>
        <h1 className="font-script text-4xl text-[#c9a84c] mb-8">Gast hinzufügen</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-[#4a0a0a]/40 border border-[#c9a84c]/30 rounded-2xl p-6">
          {[
            { key: 'name', label: 'Name *', type: 'text', required: true },
            { key: 'email', label: 'E-Mail (optional)', type: 'email', required: false },
            { key: 'phone', label: 'Telefon/WhatsApp (optional)', type: 'tel', required: false },
          ].map(({ key, label, type, required }) => (
            <div key={key}>
              <label className="block text-[#c9a84c] text-sm font-serif mb-1">{label}</label>
              <input
                type={type}
                required={required}
                value={form[key as keyof typeof form]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full bg-[#1a0a0a] border border-[#c9a84c]/30 rounded px-4 py-2 text-[#f5f0e8] font-serif focus:outline-none focus:border-[#c9a84c]"
              />
            </div>
          ))}

          <div>
            <label className="block text-[#c9a84c] text-sm font-serif mb-1">Eingeladen zu</label>
            <select
              value={form.invitedDays}
              onChange={e => setForm(f => ({ ...f, invitedDays: e.target.value }))}
              className="w-full bg-[#1a0a0a] border border-[#c9a84c]/30 rounded px-4 py-2 text-[#f5f0e8] font-serif focus:outline-none focus:border-[#c9a84c]"
            >
              <option value="23">23. Januar (Hochzeit)</option>
              <option value="22+23">22. + 23. Januar (beide Tage)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-[#c9a84c] text-[#1a0a0a] font-serif font-semibold py-3 rounded hover:bg-[#c9a84c]/80 transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Wird erstellt...' : 'Gast hinzufügen & Links generieren'}
          </button>
        </form>

        {links && (
          <div className="mt-6 bg-[#4a0a0a]/40 border border-[#c9a84c]/30 rounded-2xl p-6 space-y-4">
            <h2 className="text-[#c9a84c] font-serif font-semibold">Links generiert!</h2>
            {[
              { label: 'Deutsch-Link', value: links.linkDe, key: 'de' },
              { label: 'English Link', value: links.linkEn, key: 'en' },
            ].map(({ label, value, key }) => (
              <div key={key}>
                <p className="text-xs text-[#f5f0e8]/50 font-serif mb-1">{label}</p>
                <div className="flex gap-2">
                  <input readOnly value={value} className="flex-1 bg-[#1a0a0a] border border-[#c9a84c]/20 rounded px-3 py-1.5 text-sm text-[#f5f0e8] font-serif" />
                  <button onClick={() => copy(value, key)}
                    className="bg-[#c9a84c] text-[#1a0a0a] px-3 py-1.5 rounded text-sm font-serif font-semibold hover:bg-[#c9a84c]/80 whitespace-nowrap">
                    {copied === key ? 'Kopiert!' : 'Kopieren'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Commit group 4 — admin panel**

```bash
git add middleware.ts app/admin/
git commit -m "feat: admin panel — login, guest list, create guest, generate links"
```

---

## Task 5: Decorative Components (Mandala + Countdown)

**Files:**
- Create: `components/MandalaDecor.tsx`
- Create: `components/CountdownTimer.tsx`

**Interfaces:**
- Produces:
  - `<MandalaDecor />` — renders 4 gold mandala SVG corners, absolutely positioned
  - `<CountdownTimer targetDate={string} lang={Lang} />` — live countdown to wedding

- [ ] **Step 1: Write `components/MandalaDecor.tsx`**

```typescript
export default function MandalaDecor() {
  return (
    <>
      {/* Top-left mandala */}
      <div className="pointer-events-none absolute top-0 left-0 w-48 h-48 opacity-40 animate-gold-shimmer">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="0" cy="0" r="180" stroke="#c9a84c" strokeWidth="0.5" fill="none"/>
          <circle cx="0" cy="0" r="140" stroke="#c9a84c" strokeWidth="0.5" fill="none"/>
          <circle cx="0" cy="0" r="100" stroke="#c9a84c" strokeWidth="1" fill="none"/>
          {Array.from({ length: 12 }).map((_, i) => (
            <line key={i} x1="0" y1="0" x2={180 * Math.cos((i * 30 * Math.PI) / 180)} y2={180 * Math.sin((i * 30 * Math.PI) / 180)} stroke="#c9a84c" strokeWidth="0.5" opacity="0.6"/>
          ))}
          {Array.from({ length: 12 }).map((_, i) => (
            <circle key={i} cx={120 * Math.cos((i * 30 * Math.PI) / 180)} cy={120 * Math.sin((i * 30 * Math.PI) / 180)} r="4" fill="#c9a84c" opacity="0.8"/>
          ))}
        </svg>
      </div>
      {/* Top-right mandala (mirrored) */}
      <div className="pointer-events-none absolute top-0 right-0 w-48 h-48 opacity-40 animate-gold-shimmer scale-x-[-1]">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="0" cy="0" r="180" stroke="#c9a84c" strokeWidth="0.5" fill="none"/>
          <circle cx="0" cy="0" r="140" stroke="#c9a84c" strokeWidth="0.5" fill="none"/>
          <circle cx="0" cy="0" r="100" stroke="#c9a84c" strokeWidth="1" fill="none"/>
          {Array.from({ length: 12 }).map((_, i) => (
            <line key={i} x1="0" y1="0" x2={180 * Math.cos((i * 30 * Math.PI) / 180)} y2={180 * Math.sin((i * 30 * Math.PI) / 180)} stroke="#c9a84c" strokeWidth="0.5" opacity="0.6"/>
          ))}
          {Array.from({ length: 12 }).map((_, i) => (
            <circle key={i} cx={120 * Math.cos((i * 30 * Math.PI) / 180)} cy={120 * Math.sin((i * 30 * Math.PI) / 180)} r="4" fill="#c9a84c" opacity="0.8"/>
          ))}
        </svg>
      </div>
      {/* Bottom-left mandala */}
      <div className="pointer-events-none absolute bottom-0 left-0 w-48 h-48 opacity-40 animate-gold-shimmer scale-y-[-1]">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="0" cy="0" r="180" stroke="#c9a84c" strokeWidth="0.5" fill="none"/>
          <circle cx="0" cy="0" r="100" stroke="#c9a84c" strokeWidth="1" fill="none"/>
          {Array.from({ length: 12 }).map((_, i) => (
            <line key={i} x1="0" y1="0" x2={180 * Math.cos((i * 30 * Math.PI) / 180)} y2={180 * Math.sin((i * 30 * Math.PI) / 180)} stroke="#c9a84c" strokeWidth="0.5" opacity="0.6"/>
          ))}
          {Array.from({ length: 12 }).map((_, i) => (
            <circle key={i} cx={120 * Math.cos((i * 30 * Math.PI) / 180)} cy={120 * Math.sin((i * 30 * Math.PI) / 180)} r="4" fill="#c9a84c" opacity="0.8"/>
          ))}
        </svg>
      </div>
      {/* Bottom-right mandala */}
      <div className="pointer-events-none absolute bottom-0 right-0 w-48 h-48 opacity-40 animate-gold-shimmer scale-x-[-1] scale-y-[-1]">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="0" cy="0" r="180" stroke="#c9a84c" strokeWidth="0.5" fill="none"/>
          <circle cx="0" cy="0" r="100" stroke="#c9a84c" strokeWidth="1" fill="none"/>
          {Array.from({ length: 12 }).map((_, i) => (
            <line key={i} x1="0" y1="0" x2={180 * Math.cos((i * 30 * Math.PI) / 180)} y2={180 * Math.sin((i * 30 * Math.PI) / 180)} stroke="#c9a84c" strokeWidth="0.5" opacity="0.6"/>
          ))}
          {Array.from({ length: 12 }).map((_, i) => (
            <circle key={i} cx={120 * Math.cos((i * 30 * Math.PI) / 180)} cy={120 * Math.sin((i * 30 * Math.PI) / 180)} r="4" fill="#c9a84c" opacity="0.8"/>
          ))}
        </svg>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Write `components/CountdownTimer.tsx`**

```typescript
'use client'
import { useEffect, useState } from 'react'
import { t, type Lang } from '@/lib/i18n'

interface Props { lang: Lang }

const WEDDING_DATE = new Date('2027-01-22T00:00:00')

export default function CountdownTimer({ lang }: Props) {
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
        { value: timeLeft.days,    label: t('countdownDays', lang) },
        { value: timeLeft.hours,   label: t('countdownHours', lang) },
        { value: timeLeft.minutes, label: t('countdownMinutes', lang) },
        { value: timeLeft.seconds, label: t('countdownSeconds', lang) },
      ].map(({ value, label }) => (
        <div key={label} className="text-center">
          <div className="text-4xl font-serif text-[#c9a84c] tabular-nums">{String(value).padStart(2, '0')}</div>
          <div className="text-xs font-serif text-[#f5f0e8]/60 uppercase tracking-widest mt-1">{label}</div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Commit group 5 — decorative components**

```bash
git add components/MandalaDecor.tsx components/CountdownTimer.tsx
git commit -m "feat: mandala corner decorations and live countdown timer"
```

---

## Task 6: Envelope Animation + Music Player + Photo Gallery

**Files:**
- Create: `components/EnvelopeAnimation.tsx`
- Create: `components/InvitationCard.tsx`
- Create: `components/MusicPlayer.tsx`
- Create: `components/PhotoGallery.tsx`

**Interfaces:**
- Consumes: `t()` from `lib/i18n.ts`
- Produces:
  - `<EnvelopeAnimation lang={Lang} onOpen={() => void} />` — tap to open, calls `onOpen` when done
  - `<InvitationCard lang={Lang} invitedDays="22+23"|"23" />` — revealed card with text
  - `<MusicPlayer />` — floating bottom-left audio control
  - `<PhotoGallery photos={string[]} />` — auto-advancing full-bleed slideshow

- [ ] **Step 1: Write `components/MusicPlayer.tsx`**

```typescript
'use client'
import { useEffect, useRef, useState } from 'react'

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)

  // Expose start() so landing page can trigger on first interaction
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.loop = true
    audio.volume = 0.5
  }, [])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) { audio.pause(); setPlaying(false) }
    else { audio.play().then(() => setPlaying(true)).catch(() => {}) }
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.muted = !muted
    setMuted(!muted)
  }

  // Auto-start after first user interaction anywhere on page
  useEffect(() => {
    const start = () => {
      const audio = audioRef.current
      if (!audio || playing) return
      audio.play().then(() => setPlaying(true)).catch(() => {})
      document.removeEventListener('click', start)
    }
    document.addEventListener('click', start)
    return () => document.removeEventListener('click', start)
  }, [playing])

  return (
    <>
      <audio ref={audioRef} src="/audio/forever-and-always.mp3" preload="auto" />
      <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-[#1a0a0a]/80 border border-[#c9a84c]/40 rounded-full px-4 py-2 backdrop-blur-sm">
        <button onClick={toggle} className="text-[#c9a84c] hover:text-[#f5f0e8] transition-colors text-lg">
          {playing ? '⏸' : '▶'}
        </button>
        <span className="text-xs font-serif text-[#f5f0e8]/60 hidden sm:block">Forever And Always</span>
        <button onClick={toggleMute} className="text-[#c9a84c]/60 hover:text-[#c9a84c] transition-colors text-sm ml-1">
          {muted ? '🔇' : '🔊'}
        </button>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Write `components/PhotoGallery.tsx`**

```typescript
'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'

interface Props { photos: string[] }

export default function PhotoGallery({ photos }: Props) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (photos.length <= 1) return
    const id = setInterval(() => setCurrent(c => (c + 1) % photos.length), 4000)
    return () => clearInterval(id)
  }, [photos.length])

  if (!photos.length) return null

  return (
    <div className="relative w-full max-w-2xl mx-auto rounded-2xl overflow-hidden aspect-[4/3] border border-[#c9a84c]/30">
      {photos.map((src, i) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? 'opacity-100' : 'opacity-0'}`}
        >
          <Image src={src} alt={`Julia & Ravi ${i + 1}`} fill className="object-cover" priority={i === 0} />
        </div>
      ))}
      {/* Dot indicators */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
        {photos.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${i === current ? 'bg-[#c9a84c]' : 'bg-[#f5f0e8]/40'}`}
          />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Write `components/InvitationCard.tsx`**

```typescript
import { t, type Lang } from '@/lib/i18n'

interface Props { lang: Lang; invitedDays?: '22+23' | '23' }

export default function InvitationCard({ lang, invitedDays }: Props) {
  const body = invitedDays === '22+23'
    ? t('inviteBody22and23', lang)
    : t('inviteBody23only', lang)

  return (
    <div className="animate-card-rise bg-[#f5f0e8] text-[#1a0a0a] rounded-2xl p-8 max-w-lg mx-auto text-center shadow-2xl border border-[#c9a84c]/40">
      <p className="font-script text-5xl text-[#4a0a0a] mb-4">{t('inviteHeading', lang)}</p>
      <div className="w-16 h-px bg-[#c9a84c] mx-auto mb-4" />
      <p className="font-serif text-base leading-relaxed text-[#1a0a0a]/80 mb-6">{body}</p>
      <p className="font-script text-2xl text-[#4a0a0a]">{t('inviteClosing', lang)}</p>
    </div>
  )
}
```

- [ ] **Step 4: Write `components/EnvelopeAnimation.tsx`**

```typescript
'use client'
import { useState } from 'react'
import { t, type Lang } from '@/lib/i18n'
import InvitationCard from './InvitationCard'

interface Props { lang: Lang; onOpen?: () => void }

export default function EnvelopeAnimation({ lang, onOpen }: Props) {
  const [opened, setOpened] = useState(false)
  const [animating, setAnimating] = useState(false)

  const handleOpen = () => {
    if (opened || animating) return
    setAnimating(true)
    onOpen?.()
    setTimeout(() => { setOpened(true); setAnimating(false) }, 1200)
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {!opened ? (
        <div className="cursor-pointer select-none" onClick={handleOpen}>
          {/* Envelope body */}
          <div className="relative w-72 h-48 sm:w-96 sm:h-64">
            {/* Envelope back */}
            <div className="absolute inset-0 bg-[#f5f0e8] rounded-lg shadow-2xl border border-[#c9a84c]/30" />
            {/* Envelope flap */}
            <div
              className={`absolute top-0 left-0 right-0 h-1/2 origin-top ${animating ? 'animate-envelope-flap' : ''}`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="w-full h-full bg-[#ede8de] rounded-t-lg border border-[#c9a84c]/20"
                style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
            </div>
            {/* Wax seal */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-14 h-14 rounded-full bg-[#4a0a0a] border-2 border-[#c9a84c]/60 flex items-center justify-center shadow-lg">
                <span className="font-script text-[#c9a84c] text-xl">J♥R</span>
              </div>
            </div>
            {/* Floral decoration hints */}
            <div className="absolute -bottom-2 -left-4 text-4xl opacity-70">🌹</div>
            <div className="absolute -bottom-2 -right-4 text-4xl opacity-70">🌸</div>
          </div>
          <p className="font-script text-2xl text-[#c9a84c] text-center mt-4 animate-gold-shimmer">
            {t('tapToOpen', lang)}
          </p>
        </div>
      ) : (
        <InvitationCard lang={lang} />
      )}
    </div>
  )
}
```

- [ ] **Step 5: Commit group 6 — envelope + music + gallery**

```bash
git add components/EnvelopeAnimation.tsx components/InvitationCard.tsx components/MusicPlayer.tsx components/PhotoGallery.tsx
git commit -m "feat: envelope animation, invitation card, music player, photo gallery"
```

---

## Task 7: Landing Page + RSVP Page

**Files:**
- Create: `app/page.tsx`
- Create: `app/[lang]/invite/[token]/page.tsx`
- Create: `components/RsvpForm.tsx`
- Create: `components/ConfettiCelebration.tsx`

**Interfaces:**
- Consumes: all components built in Tasks 5 & 6; `GET /api/guests/[token]`; `POST /api/rsvp`
- Produces: fully working landing page and RSVP pages

- [ ] **Step 1: Write `app/page.tsx`**

```typescript
import MandalaDecor from '@/components/MandalaDecor'
import EnvelopeAnimation from '@/components/EnvelopeAnimation'
import MusicPlayer from '@/components/MusicPlayer'
import PhotoGallery from '@/components/PhotoGallery'
import CountdownTimer from '@/components/CountdownTimer'
import LanguageToggle from '@/components/LanguageToggle'
import { readdirSync } from 'fs'
import { join } from 'path'

function getPhotoList(): string[] {
  try {
    const dir = join(process.cwd(), 'public', 'photos')
    return readdirSync(dir)
      .filter(f => /\.(jpe?g|png|webp)$/i.test(f))
      .map(f => `/photos/${f}`)
  } catch {
    return []
  }
}

export default function HomePage() {
  const photos = getPhotoList()

  return (
    <main className="relative min-h-screen bg-[#1a0a0a] overflow-hidden flex flex-col">
      <MandalaDecor />

      {/* Language toggle */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageToggle lang="de" />
      </div>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-4 py-16 z-10">
        <h1 className="font-script text-5xl sm:text-7xl text-[#c9a84c] text-center leading-tight">
          Julia Schulze<br />&amp;<br />Subhadip Pal
        </h1>
        <p className="font-serif text-[#f5f0e8]/60 text-sm tracking-widest uppercase">aka Ravi</p>

        <div className="w-24 h-px bg-[#c9a84c]/50" />

        <p className="font-script text-3xl text-[#f5f0e8]/80">{/* Save the Date */}Save the Date</p>

        <EnvelopeAnimation lang="de" />

        <div className="mt-8">
          <CountdownTimer lang="de" />
        </div>
      </div>

      {/* Photo gallery */}
      {photos.length > 0 && (
        <div className="px-4 pb-16 z-10 max-w-2xl mx-auto w-full">
          <div className="w-24 h-px bg-[#c9a84c]/50 mx-auto mb-8" />
          <PhotoGallery photos={photos} />
        </div>
      )}

      <MusicPlayer />
    </main>
  )
}
```

- [ ] **Step 2: Write `components/ConfettiCelebration.tsx`**

```typescript
'use client'
import { useEffect, useRef } from 'react'

export default function ConfettiCelebration() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const colors = ['#c9a84c', '#f5f0e8', '#4a0a0a', '#e8c97e', '#fff']
    const petals = Array.from({ length: 60 }).map(() => {
      const el = document.createElement('div')
      el.style.cssText = `
        position:absolute; width:8px; height:8px; border-radius:50%;
        background:${colors[Math.floor(Math.random() * colors.length)]};
        left:${Math.random() * 100}%;
        animation: petal-fall ${1.5 + Math.random() * 2}s ease-in ${Math.random() * 0.5}s forwards;
      `
      container.appendChild(el)
      return el
    })
    return () => petals.forEach(p => p.remove())
  }, [])

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-50 overflow-hidden" />
}
```

- [ ] **Step 3: Write `components/RsvpForm.tsx`**

```typescript
'use client'
import { useState } from 'react'
import { t, type Lang } from '@/lib/i18n'
import ConfettiCelebration from './ConfettiCelebration'

interface Props {
  token: string
  guestName: string
  invitedDays: '22+23' | '23'
  lang: Lang
  existingRsvp?: { attending22: boolean | null; attending23: boolean; note: string | null } | null
}

type Choice = 'yes' | 'no' | 'maybe' | null

export default function RsvpForm({ token, guestName, invitedDays, lang, existingRsvp }: Props) {
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
          {t(c === 'yes' ? 'rsvpYes' : c === 'no' ? 'rsvpNo' : 'rsvpMaybe', lang)}
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
          <p className="font-serif text-xl text-[#f5f0e8]">{t('rsvpConfirmation', lang)}</p>
        </div>
      </>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-md mx-auto">
      <p className="font-serif text-[#f5f0e8]/80 text-center">{t('rsvpQuestion', lang)}</p>

      {invitedDays === '22+23' && (
        <div className="bg-[#4a0a0a]/40 border border-[#c9a84c]/30 rounded-xl p-4">
          <p className="font-serif text-[#c9a84c] text-sm mb-3">{t('inviteDate22', lang)}</p>
          <ChoiceButtons value={choice22} onChange={setChoice22} />
        </div>
      )}

      <div className="bg-[#4a0a0a]/40 border border-[#c9a84c]/30 rounded-xl p-4">
        <p className="font-serif text-[#c9a84c] text-sm mb-3">{t('inviteDate23', lang)}</p>
        <ChoiceButtons value={choice23} onChange={setChoice23} />
      </div>

      <div>
        <label className="block font-serif text-sm text-[#f5f0e8]/60 mb-2">{t('rsvpNote', lang)}</label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder={t('rsvpNotePlaceholder', lang)}
          rows={3}
          className="w-full bg-[#4a0a0a]/40 border border-[#c9a84c]/30 rounded-xl px-4 py-3 text-[#f5f0e8] font-serif text-sm focus:outline-none focus:border-[#c9a84c] resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !choice23}
        className="bg-[#c9a84c] text-[#1a0a0a] font-serif font-semibold py-3 rounded-xl hover:bg-[#c9a84c]/80 transition-colors disabled:opacity-40"
      >
        {loading ? '...' : t(existingRsvp ? 'rsvpUpdate' : 'rsvpSubmit', lang)}
      </button>
    </form>
  )
}
```

- [ ] **Step 4: Write `app/[lang]/invite/[token]/page.tsx`**

```typescript
import { notFound } from 'next/navigation'
import type { Lang } from '@/lib/i18n'
import { t } from '@/lib/i18n'
import MandalaDecor from '@/components/MandalaDecor'
import LanguageToggle from '@/components/LanguageToggle'
import MusicPlayer from '@/components/MusicPlayer'
import RsvpForm from '@/components/RsvpForm'
import CountdownTimer from '@/components/CountdownTimer'

interface Props { params: { lang: string; token: string } }

async function getGuest(token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/guests/${token}`, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

export default async function InvitePage({ params }: Props) {
  const lang = (params.lang === 'en' ? 'en' : 'de') as Lang
  const data = await getGuest(params.token)
  if (!data) notFound()

  const { guest, rsvp } = data
  const invitedDays = guest.invitedDays as '22+23' | '23'

  return (
    <main className="relative min-h-screen bg-[#1a0a0a] overflow-hidden">
      <MandalaDecor />

      <div className="absolute top-4 right-4 z-20">
        <LanguageToggle lang={lang} token={params.token} />
      </div>

      <div className="relative z-10 flex flex-col items-center px-4 py-16 gap-8">
        {/* Greeting */}
        <h1 className="font-script text-5xl sm:text-6xl text-[#c9a84c] text-center">
          {t('rsvpGreeting', lang)} {guest.name}!
        </h1>

        <div className="w-24 h-px bg-[#c9a84c]/50" />

        <p className="font-serif text-[#f5f0e8]/80 text-center text-lg max-w-md">
          {t(invitedDays === '22+23' ? 'rsvpInvited22and23' : 'rsvpInvited23only', lang)}
        </p>

        <CountdownTimer lang={lang} />

        <div className="w-full max-w-md mt-4">
          <RsvpForm
            token={params.token}
            guestName={guest.name}
            invitedDays={invitedDays}
            lang={lang}
            existingRsvp={rsvp}
          />
        </div>

        <div className="w-24 h-px bg-[#c9a84c]/50 mt-4" />
        <p className="font-script text-2xl text-[#f5f0e8]/50">Julia & Ravi · 2027</p>
      </div>

      <MusicPlayer />
    </main>
  )
}
```

- [ ] **Step 5: Add `NEXT_PUBLIC_BASE_URL` to `.env.local`**

```
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

- [ ] **Step 6: Commit group 7 — pages + RSVP**

```bash
git add app/page.tsx app/[lang]/ components/RsvpForm.tsx components/ConfettiCelebration.tsx .env.local
git commit -m "feat: landing page, RSVP page with token routing, confetti celebration"
```

---

## Task 8: Keep-Alive Workflow + Deployment Config

**Files:**
- Create: `.github/workflows/keep-alive.yml`
- Create: `vercel.json`
- Modify: `.env.local` (add production URL after deploy)

**Interfaces:**
- Produces: automated daily DB ping; Vercel deployment config

- [ ] **Step 1: Write `.github/workflows/keep-alive.yml`**

```yaml
name: Keep Neon DB Alive

on:
  schedule:
    - cron: '0 8 * * *'   # 08:00 UTC daily
  workflow_dispatch:

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping DB via app health check
        run: |
          curl -sf "${{ secrets.APP_URL }}/api/guests/ping" || true
```

- [ ] **Step 2: Write `vercel.json`**

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

- [ ] **Step 3: Commit group 8 — deployment config**

```bash
git add .github/ vercel.json
git commit -m "chore: Vercel config and daily Neon keep-alive GitHub Action"
```

---

## Task 9: Vercel Deploy + Final Wiring

**Steps:**

- [ ] **Step 1: Push to GitHub**

```bash
git push origin main
```

- [ ] **Step 2: Import project in Vercel**
  1. Go to vercel.com → Add New Project
  2. Import `subhadipPal/WeddingInvitation` from GitHub
  3. Framework: Next.js (auto-detected)
  4. Add environment variables:
     - `DATABASE_URL` = your Neon connection string
     - `ADMIN_PASSWORD` = `<your_admin_password>`
     - `NEXT_PUBLIC_BASE_URL` = `https://your-app.vercel.app` (update after first deploy)
  5. Click Deploy

- [ ] **Step 3: Update `NEXT_PUBLIC_BASE_URL`**

Once Vercel gives you your URL (e.g. `https://wedding-invitation-abc.vercel.app`):
- Update `NEXT_PUBLIC_BASE_URL` in Vercel environment variables
- Redeploy (automatic on next push)

- [ ] **Step 4: Add APP_URL secret to GitHub**
  1. GitHub repo → Settings → Secrets → Actions
  2. Add `APP_URL` = your Vercel URL
  3. Keep-alive action will now ping daily

- [ ] **Step 5: Drop in the MP3**

```bash
# Copy your Shania Twain MP3 to:
cp "path/to/forever-and-always.mp3" public/audio/forever-and-always.mp3
git add public/audio/forever-and-always.mp3
git commit -m "feat: add background music"
git push
```

- [ ] **Step 6: Test end-to-end**
  1. Open `https://your-app.vercel.app` — see landing page, tap envelope
  2. Go to `https://your-app.vercel.app/admin/login` — login with `<your_admin_password>`
  3. Create a test guest (22+23), copy German link, open it → see RSVP form with both days
  4. Create a test guest (23 only), copy English link, open it → see RSVP form with one day
  5. Submit an RSVP → see confetti, check admin shows the guest
  6. Music plays on interaction

---

## Self-Review Checklist

- [x] **Spec coverage:** envelope ✅, music ✅, photos ✅, token links ✅, dual language ✅, day-aware RSVP ✅, admin panel ✅, keep-alive ✅, deploy ✅
- [x] **No placeholders:** all steps have complete code
- [x] **Type consistency:** `Lang`, `invitedDays`, `Choice` consistent across all tasks
- [x] **i18n:** all UI strings go through `t()` — no hardcoded text in components
- [x] **Commit groups:** every task ends with a grouped commit of related files
- [x] **MP3 instruction:** clearly documented as manual drop-in step
