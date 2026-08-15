# Wedding Invitation App — Design & Implementation Plan
**Julia Schulze & Subhadip Pal (aka Ravi)**
**22nd & 23rd January 2027 · Berlin**

---

## 1. Overview

A custom wedding invitation web app with:
- Beautiful Indo-German themed landing page (dark burgundy, gold, mandala motifs)
- Animated envelope opening experience
- Background music on load (Shania Twain — Forever and Always)
- Photo gallery from couple's photos
- Guest-specific RSVP via unique links (WhatsApp/email shareable)
- Two guest groups: 22+23 Jan invited vs. 23 Jan only
- German/English language toggle
- Admin panel to manage guests and view RSVPs

---

## 2. Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) | React + API routes in one project, zero-config Vercel deploy |
| Language | TypeScript | Type safety, fewer runtime bugs |
| Styling | Tailwind CSS + custom CSS animations | Rapid styling + fine-grained animation control |
| Database | Neon (Postgres) | Free tier, never pauses, EU Frankfurt region |
| ORM | Drizzle ORM | Lightweight, type-safe, works perfectly with Neon |
| Hosting | Vercel | Auto-deploy on git push, free tier |
| Fonts | Google Fonts (Great Vibes + Cormorant Garamond) | Elegant script + serif matching Indo-German aesthetic |
| Audio | HTML5 Audio API | Auto-play music on first interaction |
| Images | Next.js Image (static assets in /public) | Optimized, served from Vercel CDN |

---

## 3. Project Structure

```
WeddingInvitation/
├── app/
│   ├── page.tsx                  # Landing page (envelope animation + music)
│   ├── invite/[token]/page.tsx   # Guest RSVP page (auto-identified by token)
│   ├── admin/
│   │   ├── page.tsx              # Admin dashboard (guest list + RSVP overview)
│   │   └── create/page.tsx       # Create new guest + generate link
│   └── api/
│       ├── guests/route.ts       # GET all guests, POST create guest
│       ├── guests/[token]/route.ts  # GET guest by token
│       └── rsvp/route.ts         # POST submit RSVP response
├── components/
│   ├── EnvelopeAnimation.tsx     # Animated wax-seal envelope opening
│   ├── MusicPlayer.tsx           # Background music controller
│   ├── PhotoGallery.tsx          # Couple's photo slideshow
│   ├── RsvpForm.tsx              # RSVP form (days shown based on guest group)
│   ├── LanguageToggle.tsx        # DE/EN switcher
│   ├── CountdownTimer.tsx        # Countdown to wedding day
│   └── MandalaDecor.tsx          # Decorative mandala SVG elements
├── lib/
│   ├── db.ts                     # Neon database connection (Drizzle)
│   ├── schema.ts                 # Database schema (guests + rsvp tables)
│   ├── tokens.ts                 # Token generation utility
│   └── i18n.ts                   # German/English translations
├── public/
│   ├── audio/
│   │   └── forever-and-always.mp3  # Shania Twain song (you add this file)
│   ├── photos/                   # Copied from /Users/I584745/Invitation Photos/
│   └── decorations/              # Mandala SVGs, rose petal PNGs
├── .env.local                    # DATABASE_URL + ADMIN_PASSWORD (git-ignored)
├── .env.example                  # Template for env vars (committed)
└── docs/
    └── WEDDING_INVITATION_PLAN.md  # This file
```

---

## 4. Database Schema

### Table: `guests`
| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Auto-generated |
| `token` | varchar(12) | Unique URL token (e.g. `abc123xyz`) |
| `name` | varchar(100) | Guest name (shown on their page) |
| `email` | varchar(200) | Optional — for email invites |
| `phone` | varchar(30) | Optional — for WhatsApp invites |
| `invited_days` | varchar(10) | `"22+23"` or `"23"` |
| `language` | varchar(2) | Default language: `"de"` or `"en"` |
| `created_at` | timestamp | When guest was added |

### Table: `rsvps`
| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Auto-generated |
| `guest_id` | uuid (FK → guests) | Which guest |
| `attending_22` | boolean / null | Will attend 22 Jan? (null if not invited) |
| `attending_23` | boolean | Will attend 23 Jan? |
| `note` | text | Optional message to the couple |
| `submitted_at` | timestamp | When RSVP was submitted |
| `updated_at` | timestamp | Last update |

---

## 5. Guest Link System

- Each guest gets a **unique token** (e.g. `x7k9m2`) generated on creation
- Admin panel generates **two links per guest** — one German, one English:
  - `https://yourapp.vercel.app/de/invite/x7k9m2` → German version
  - `https://yourapp.vercel.app/en/invite/x7k9m2` → English version
- You send whichever fits the guest — German link to German-speaking guests, English to international
- When they open it, app loads the correct language + shows their name + correct days
- Language toggle still works on both links
- RSVP is tied to the token — no login, no password
- Link is safe to share on WhatsApp (short, clean URL)

**Example links:**
```
https://julia-ravi-2027.vercel.app/de/invite/x7k9m2   → "Hallo Priya! Du bist eingeladen am 22. + 23. Jan"
https://julia-ravi-2027.vercel.app/en/invite/x7k9m2   → "Hello Priya! You are invited on 22 + 23 Jan"
https://julia-ravi-2027.vercel.app/de/invite/a3b8c1   → "Hallo Thomas! Du bist eingeladen am 23. Jan"
```

---

## 6. Pages & Features

### 6.1 Landing Page (`/`)
- Full-screen dark burgundy background with gold mandala corner decorations
- Animated wax-sealed envelope in center (same motif as existing Canva site)
- Couple names in gold Great Vibes script: *"Julia Schulze & Subhadip Pal"*
- "Tap to open" instruction in cursive
- **On tap/click:** envelope flap opens with CSS animation → invitation card slides out
- Background music starts on first interaction (browser policy requirement)
- Photo gallery visible after envelope opens (slideshow of couple's 11 photos)
- Countdown timer to 22 Jan 2027
- Language toggle (DE/EN) top right

### 6.2 RSVP Page (`/invite/[token]`)
- Personalized greeting: *"Liebe/r [Name], du bist herzlich eingeladen..."*
- Shows **only the days they are invited to:**
  - Group "22+23": Two RSVP cards — Friday 22 Jan (Indian ceremony) + Saturday 23 Jan (wedding)
  - Group "23": One RSVP card — Saturday 23 Jan only
- Each day card has: Yes / No / Maybe buttons + optional text note
- Submit button → saves to DB → shows confirmation with animated confetti
- Can return to update their RSVP (link always works)
- Same Indo-German styling as landing page

### 6.3 Admin Panel (`/admin`)
- Protected by a simple password (set in `.env.local`)
- **Guest list table:** Name, phone/email, invited days, RSVP status, their link (copy button)
- **Create guest form:**
  - Name (required)
  - Email (optional)
  - Phone (optional)
  - Invited days: dropdown → "22 + 23 Jan" or "23 Jan only"
  - Default language: DE / EN
  - → Generates unique link instantly, saves to DB
- **Stats summary:** Total invited / Confirmed / Declined / Pending
- **Export button:** Download guest list + RSVPs as CSV

---

## 7. Music

- File: `public/audio/forever-and-always.mp3` (you provide the MP3)
- Plays automatically on first user interaction (envelope tap)
- Floating music control button (bottom left): pause/play + song name
- Loops continuously
- Respects user's mute preference (saved to localStorage)

---

## 8. Language (i18n)

All UI strings in both German and English. Toggle persists via localStorage.

**Key strings (examples):**
| Key | German | English |
|---|---|---|
| `greeting` | "Du bist herzlich eingeladen" | "You are cordially invited" |
| `rsvp_yes` | "Ich komme!" | "I'll be there!" |
| `rsvp_no` | "Leider nicht möglich" | "Unfortunately can't make it" |
| `rsvp_maybe` | "Vielleicht" | "Maybe" |
| `date_22` | "Freitag, 22. Januar 2027" | "Friday, 22nd January 2027" |
| `date_23` | "Samstag, 23. Januar 2027" | "Saturday, 23rd January 2027" |

---

## 9. Deployment Steps

### Step 1 — Local setup
```bash
cd /Users/I584745/WeddingInvitation
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir
npm install drizzle-orm @neondatabase/serverless drizzle-kit
```

### Step 2 — Environment variables
Create `.env.local`:
```
DATABASE_URL=postgresql://user:...@host/dbname?sslmode=require
ADMIN_PASSWORD=<your_admin_password>
```

### Step 3 — Run DB migrations
```bash
npx drizzle-kit push
```

### Step 4 — Add your assets
- Copy MP3 to: `public/audio/forever-and-always.mp3`
- Photos are auto-copied from `/Users/I584745/Invitation Photos/` during setup

### Step 5 — Test locally
```bash
npm run dev
# Opens at http://localhost:3000
```

### Step 6 — Deploy to Vercel
```bash
git add . && git commit -m "initial commit"
git push origin main
```
Then in Vercel dashboard:
- Import `subhadipPal/WeddingInvitation` from GitHub
- Add environment variable: `DATABASE_URL` + `ADMIN_PASSWORD`
- Deploy → live at `https://wedding-invitation-xxx.vercel.app`

### Step 7 — Custom domain (optional)
- In Vercel → Domains → add your domain (e.g. `julia-und-ravi.de`)
- Point DNS to Vercel — takes ~10 min

---

## 10. GitHub Actions — Keep DB Alive

A daily ping to prevent any future Neon free tier hibernation:

```yaml
# .github/workflows/keep-alive.yml
# Runs every day at 08:00 UTC — pings the DB to keep it active
```

---

## 11. Decisions Confirmed

- **Save the Date only** — no venue details
- **Event name** — "Hochzeit" for both days
- **RSVP deadline** — none, form stays open permanently
- **Dress code** — not included
- **Music** — MP3 placeholder included; drop `forever-and-always.mp3` into `public/audio/` to activate
- **Admin password** — set in `.env.local` as `ADMIN_PASSWORD`
- **Guest links** — two links generated per guest (German + English)
- **Language** — determined by link prefix (`/de/` or `/en/`), toggle available on both

---

## 12. Timeline

| Phase | What | Est. time |
|---|---|---|
| Phase 1 | Scaffold Next.js, DB schema, API routes | ~2 hours |
| Phase 2 | Landing page + envelope animation | ~2 hours |
| Phase 3 | RSVP page (token-based, day-aware) | ~1.5 hours |
| Phase 4 | Admin panel | ~1.5 hours |
| Phase 5 | Music, photo gallery, i18n, polish | ~2 hours |
| Phase 6 | Deploy to Vercel + test end-to-end | ~30 min |
| **Total** | | **~9.5 hours** |
