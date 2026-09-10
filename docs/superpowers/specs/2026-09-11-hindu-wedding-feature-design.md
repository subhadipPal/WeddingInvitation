# Hindu Wedding Feature — Design Spec

**Date:** 2026-09-11  
**Branch:** `feat/hindu-wedding` (from `main`)  
**PR target:** `main`

---

## Overview

Add a third wedding event — Hindu Wedding on 28th January 2027, 5:30 PM at Sri Sri Karunamoyee Kali Temple, Kolkata, India. India guests get a separate invitation page with Bengali language support, a Google Maps embed with directions, and a simplified RSVP (attending + note, no postal address). Existing Berlin invites (22nd + 23rd January) are completely unaffected.

---

## 1. Data Model

### `guests` table — two new columns
```sql
ALTER TABLE guests ADD COLUMN is_bengali boolean NOT NULL DEFAULT false;
-- invitedDays varchar(10) already exists — gains new valid value '28', no column change needed
```

### `rsvps` table — one new column
```sql
ALTER TABLE rsvps ADD COLUMN attending_28 boolean;
-- nullable — existing rows stay NULL, only populated for invitedDays = '28' guests
```

### `content` table
New keys stored with the existing key/lang/value pattern, namespaced `hindu_*`. No schema change — just new rows. Keys cover all text sections of the Hindu invite (see Section 5).

### `Lang` type
Add `'bn'` (Bengali) alongside `'de'` and `'en'`. The `translations` object in `lib/i18n.ts` gets a `bn` entry.

### Drizzle migration
Run `npx drizzle-kit push` against the production Neon DB **before merging the PR**. Columns are nullable/defaulted — zero impact on existing rows. This is a mandatory pre-merge step documented in the PR checklist.

---

## 2. Routing & Language

### URL structure
No new routes. Existing `/[lang]/invite/[token]` handles all three event types. The page reads `guest.invitedDays`:
- `'22+23'` or `'23'` → render `<ScrollInvitation>` (unchanged)
- `'28'` → render `<HinduScrollInvitation>` (new)

### Bengali routing
`/bn/invite/[token]` works automatically — `[lang]` is a dynamic segment. `loadTranslations('bn')` follows the same DB-override pattern as DE/EN.

### Language toggle on Hindu invite
`LanguageToggle` receives a new optional `langs?: Lang[]` prop defaulting to `['de', 'en']`. Berlin invites pass nothing → identical behaviour. Hindu invite passes `['en', 'bn']`. DE button never appears on India invite pages.

### Admin-generated links
- `invitedDays = '22+23'` or `'23'`: DE + EN links (unchanged)
- `invitedDays = '28'`, `isBengali = false`: EN link only
- `invitedDays = '28'`, `isBengali = true`: EN + BN links

---

## 3. `HinduScrollInvitation` Component

**File:** `components/HinduScrollInvitation.tsx`

Same scroll-snap structure and dark-red/gold color palette as `ScrollInvitation`. Shared low-level helpers (`Section`, `FadeIn`, `BgPhoto`, `useInView`) extracted to `components/invitation-helpers.tsx` so both components import them — no duplication.

### Sections

| # | Section | Content |
|---|---------|---------|
| 1 | Hero + Envelope | Same `EnvelopeAnimation` component (unmodified). "Save the Date — 28th January 2027" beneath couple names. Language toggle (EN/BN). |
| 2 | Invitation body | `Dear [Name]` greeting. Body text: Hindu wedding details + brief mention that civil ceremony is on 22nd Jan in Berlin. Closing sign-off. |
| 3 | Date + Time | Date card: "28th January 2027 — 5:30 PM". Countdown timer targeting 28 Jan 2027 17:30 IST. Location: "Kolkata, India". |
| 4 | Photo gallery | Same slideshow as Berlin invite — auto-advances, dot indicators. |
| 5 | Venue + Map + RSVP | Temple name + address. Google Maps iframe (no API key). "Get Directions" button. Then RSVP form. |

### Map & Directions
- **Venue:** Sri Sri Karunamoyee Kali Temple
- **Coordinates:** `22.4859647, 88.3396868`
- **Embed URL:** `https://www.google.com/maps/embed/v1/place?key=...` or frameless embed via coordinates
- **Directions button URL:** `https://www.google.com/maps/dir/?api=1&destination=22.4859647%2C88.3396868` — Google Maps prompts the user for their current location automatically on any device
- **CSP pre-check:** Before writing the component, check `next.config.ts` for `frame-src` CSP directives. Add `https://www.google.com` if needed.

---

## 4. RSVP

### Form (`RsvpForm` changes)
`invitedDays` prop type widens to `'22+23' | '23' | '28'`. When `'28'`:
- Single yes/no choice for 28th Jan only
- No address field
- Note field (optional)
- No `choice22` / `choice23` state

Existing Berlin form rendering paths are behind `invitedDays !== '28'` guards — zero change to their logic.

### API (`/api/rsvp` route)
Validation changes from:
```ts
if (!token || attending23 === undefined) → 400
```
to:
```ts
if (!token || (attending23 === undefined && attending28 === undefined)) → 400
```
Existing Berlin calls always send `attending23` — unaffected. Day-28 calls send `attending28`.

DB write: upserts `attending28` when present, leaves `attending22`/`attending23` null for India guests.

---

## 5. Content Keys (Hindu Wedding)

All stored in the `content` table as `hindu_*` keys. Default values live in `lib/i18n.ts` under `translations.en` / `translations.bn` (no DE needed for India invite).

| Key | Description |
|-----|-------------|
| `hindu_coupleNames` | Couple names (may differ in Bengali script) |
| `hindu_saveTheDate` | "Save the Date" label |
| `hindu_tapToOpen` | Envelope tap text |
| `hindu_inviteHeading` | Main heading |
| `hindu_inviteBody` | Invitation body (mentions Berlin 22nd Jan context) |
| `hindu_inviteBodyMulti` | Multi-person variant (BN plural forms) |
| `hindu_inviteDate` | Date line: "28th January 2027 — 5:30 PM" |
| `hindu_inviteClosing` | Closing sign-off |
| `hindu_venueName` | Temple name |
| `hindu_venueAddress` | Full address text |
| `hindu_venueDirections` | "Get Directions" button label |
| `hindu_calendarLabel` | "Mark your calendar" equivalent |
| `hindu_rsvpGreeting` | RSVP greeting prefix |
| `hindu_rsvpQuestion` | RSVP question |
| `hindu_rsvpYes` | Yes button |
| `hindu_rsvpNo` | No button |
| `hindu_rsvpNote` | Note field label |
| `hindu_rsvpNotePlaceholder` | Note field placeholder |
| `hindu_rsvpSubmit` | Submit button |
| `hindu_rsvpUpdate` | Update button |
| `hindu_rsvpConfirmation` | Post-submit confirmation message |

---

## 6. Admin Changes

### Guest creation form (`app/admin/create/page.tsx`)
- "Invited to" dropdown gains: `<option value="28">28th January (Hindu Wedding, Kolkata)</option>`
- `isBengali` checkbox appears only when `invitedDays === '28'`: `"Bengali language support — adds BN invite link"`
- Generated links section adapts: shows EN + BN (if `isBengali`) for India guests, DE + EN for Berlin guests
- `isBengali` sent in POST body to `/api/guests`

### Guest card (`app/admin/page.tsx`)
- "Invited" chip: `invitedDays === '28'` → shows `'28 Jan (India)'`
- RSVP row: `invitedDays === '28'` → shows RSVP 28 status instead of RSVP 22/23
- Links row: `invitedDays === '28'` → shows EN + BN buttons instead of DE + EN
- `isBengali` badge on guest card (small chip, like the existing `Group` badge)

### `/api/guests` POST + GET
- POST: accept and persist `isBengali`
- GET: include `isBengali` in returned guest objects

### Content editor tab (`app/admin/page.tsx`)
New collapsible section **"Hindu Wedding — India (28 Jan)"** added below existing content groups. Shows all `hindu_*` keys. Columns: EN + BN (no DE). Uses the same textarea editor pattern as existing groups. Saving uses the same auto-save mechanism — keys are added to `GUEST_FACING_KEYS` (or a new `HINDU_GUEST_FACING_KEYS` array to keep them separate).

---

## 7. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Migration runs after deploy → new columns missing → 500s | Mandatory PR checklist: run `drizzle-kit push` against production Neon DB **before** merging. Columns are nullable/defaulted so no downtime. |
| `/api/rsvp` rejects day-28 RSVPs (validates `attending23` required) | Update validation: `attending23 === undefined && attending28 === undefined` → 400. One-line fix. |
| `LanguageToggle` hardcodes DE+EN — change risks Berlin invites | Add optional `langs?: Lang[]` prop, default `['de', 'en']`. Berlin passes nothing → no change. |
| Google Maps iframe blocked by CSP | First implementation step: inspect `next.config.ts` for `frame-src`. Add `https://www.google.com` if needed. |
| `feat/envelope-redesign` conflicts | Branch from `main`, not from envelope branch. `EnvelopeAnimation.tsx` used read-only — not modified. |

---

## 8. Implementation Order

1. Check CSP in `next.config.ts` — add Google Maps if needed
2. DB schema: add columns to `lib/schema.ts`, run `drizzle-kit push` on dev DB
3. `lib/i18n.ts`: add `'bn'` to `Lang`, add `hindu_*` keys to `Translations` interface + default values for EN + BN
4. `lib/i18n.server.ts`: handle `'bn'` in `loadTranslations`
5. Extract shared helpers → `components/invitation-helpers.tsx`
6. `components/LanguageToggle.tsx`: add `langs` prop
7. `components/HinduScrollInvitation.tsx`: build new component
8. `app/[lang]/invite/[token]/page.tsx`: add `invitedDays === '28'` branch
9. `components/RsvpForm.tsx`: widen `invitedDays` type, add day-28 rendering path
10. `app/api/rsvp/route.ts`: fix validation, handle `attending28`
11. `app/api/guests/route.ts`: accept + return `isBengali`
12. `app/admin/create/page.tsx`: add `'28'` option, `isBengali` checkbox, BN link output
13. `app/admin/page.tsx`: update guest cards + content editor
14. Write + push migration SQL notes in PR description
15. Open PR against `main` — Vercel preview auto-deploys for testing before merge

---

## 9. Out of Scope

- Hindi language support (only EN + BN)
- Separate subdomain or vanity URL for India invite
- Dietary / headcount fields in India RSVP
- Any changes to Berlin invite rendering or existing guest records
