# Marriage Invitation Card (MIC) — Feature Design

**Date:** 2026-10-26
**Status:** Draft, ready for review
**Companion:** `docs/MarriageInvitationCard/Wireframes.md`
**Supersedes:** earlier drafts in this file.

---

## 1. Goal

Add a **Marriage Invitation Card** (MIC) — a new, personalized, German-only page shown to Berlin wedding guests (`invited_days ∈ {'22+23', '23'}`). It replaces the Save-the-Date (STD) as the "main" guest-facing experience by generating new per-guest links. The existing STD page + links stay fully functional and are reachable from MIC via a hamburger-menu button.

Kolkata-only guests (`invited_days = '28'`) are unaffected.

**Priority:** mobile first (≤480 px) → iPad (481–1024 px) → desktop. All visual effects (curtain, petal overlay) are **modular and admin-toggleable** so we can kill either/both without redeploying.

## 2. Non-goals (first commit)

- English or Bengali versions of MIC. German only.
- Hindu wedding teaser section.
- "A Thousand Years" music.
- Hero artwork beyond the baked image.
- Crop UI in admin.
- Migrating existing guests to MIC RSVP data.

## 3. User-facing behavior

### 3.1 Route

`/[lang]/marriage-invitation/[mic_token]` — only `lang = de` renders. (We decide during impl whether to drop the `[lang]` segment entirely.)

Old `/[lang]/invite/[token]` keeps working and renders current STD.

### 3.2 Page structure

Scrollable snap sections, same pattern as `ScrollInvitation`:

1. **Hero** — baked image carries "JULIA & SUBHADIP · BERLIN MEETS BENGAL" title; `micHeroDate` overlays the date in gold.
2. **22 Jan block** — personalized, hidden entirely if `invited_days === '23'`. Timetable + Hochzeitsvilla + Zehlendorfer Hof.
3. **23 Jan block** — personalized, shown to everyone. Timetable + Esszimmer Mahlsdorf.
4. **FAQ** — dress code, gifts, children, RSVP deadline (**15 Jan 2027** accented), photos.
5. **RSVP** — optional. `attending22` (if invited), `attending23`, address, note.
6. **Closing** — sign-off.

Each section has one admin-editable background image (slots: `hero`, `day22Bg`, `day23Bg`, `faqBg`, `rsvpBg`, `closingBg`).

### 3.3 Hero image — three-tier responsive strategy

- **Tier 1 — admin breakpoint variants in Vercel Blob:** `hero.variant = 'mobile' | 'tablet' | 'desktop'`. Served via `<picture>` + `media` queries. Art-directed crops.
- **Tier 2 — admin generic variant in Blob:** `hero.variant = 'default'`. Used if a specific variant missing.
- **Tier 3 — baked default:** `public/photos/MIC/MIC_home.jpeg`. Always present. Day-one ship works with zero admin action.

Other 5 slots: single upload each (`variant = 'default'`). `<Image sizes>` + `object-fit: cover`.

### 3.4 Curtain + petal overlay (toggleable — see §9)

Permanent **proscenium frame** around all 6 sections. Opens on load, stops at fringe position, stays:

- Mobile ≤480 px: 6% fringe per side (~22 px on 375 px screen).
- iPad 481–1024 px: 10% fringe per side.
- Desktop >1024 px: 15% fringe per side.

10 pleated slats per panel, alternating burgundy (`#4a0a0a` / `#3a0808`) at `opacity: 0.8`, gold inner edge (`#c9a84c`), cream outer highlight. Pleated hem via `border-bottom-radius: 40px`.

Red rose petals (`#8a1538`) fall continuously across all sections via one fixed-positioned overlay (ported Sakura engine, no jQuery, ~60 LOC React hook).

Both effects respect `prefers-reduced-motion` and can be individually toggled off by admin.

### 3.5 Hamburger menu

Top-right. Fades in after curtain finishes. One item in first commit: "Save-the-Date öffnen" (opens STD in new tab).

### 3.6 Placeholder when image missing

Burgundy gradient card with "Bild wird noch hochgeladen". Never falls back to STD photos — explicit "upload me" state.

## 4. Admin changes

### 4.1 Tabs

`Guests | Save-the-Date Content | Marriage-Invitation Content` (was two tabs; Hindu content stays under STD tab).

### 4.2 Guest card — Berlin guest

Adds: `MIC RSVP 22` + `MIC RSVP 23` row (status display), `MIC-Link generieren` / `Kopieren` button.

### 4.3 Guest card — Kolkata guest

Unchanged. No MIC row.

### 4.4 Marriage-Invitation Content tab

Three sections:

1. **Images** — 3 hero variants (desktop, tablet, mobile) + 5 single-upload slots. Upload goes to Vercel Blob via `sharp` resize.
2. **Text (German)** — grouped MIC content keys with debounced autosave.
3. **Toggles** — two kill-switches:
   - `micEnableCurtain` (default ON) — curtain + opening animation.
   - `micEnablePetals` (default ON) — red rose particle overlay.

### 4.5 CSV + PDF exports

Add MIC columns: `MIC RSVP 22`, `MIC RSVP 23`, `MIC Address`, `MIC Note`, `MIC Token`, `MIC Link`.

## 5. Database changes

All additive. Raw SQL / `ALTER` — **no `drizzle-kit push`**.

### 5.1 `guests` — new column

```sql
ALTER TABLE guests ADD COLUMN IF NOT EXISTS mic_token varchar(12) UNIQUE;
```

Nullable. Admin button populates it. Only Berlin guests get one.

### 5.2 `mic_content` — new table

Same shape as existing `content`:

```sql
CREATE TABLE mic_content (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key        varchar(60) NOT NULL,
  lang       varchar(2)  NOT NULL DEFAULT 'de',
  value      text        NOT NULL,
  updated_at timestamp   NOT NULL DEFAULT now(),
  UNIQUE (key, lang)
);
```

Stores text content keys + the two toggle values (`micEnableCurtain`, `micEnablePetals` with string `'true'`/`'false'`).

### 5.3 `mic_images` — new table

```sql
CREATE TABLE mic_images (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot        varchar(40) NOT NULL,
  variant     varchar(20) NOT NULL DEFAULT 'default',
  url         text        NOT NULL,
  uploaded_at timestamp   NOT NULL DEFAULT now(),
  UNIQUE (slot, variant)
);
```

### 5.4 `mic_rsvps` — new table

```sql
CREATE TABLE mic_rsvps (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id      uuid NOT NULL REFERENCES guests(id),
  attending_22  boolean,
  attending_23  boolean,
  address       text,
  note          text,
  submitted_at  timestamp NOT NULL DEFAULT now(),
  updated_at    timestamp NOT NULL DEFAULT now(),
  UNIQUE (guest_id)
);
```

### 5.5 Drizzle schema

Add corresponding `pgTable` definitions for `micContent`, `micImages`, `micRsvps`; add `micToken` field to `guests`. Mirror the SQL above.

## 6. API routes

All MIC APIs prefixed `/api/mic-*`. Existing APIs unchanged.

| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/api/mic-content` | GET | admin | Return merged defaults + overrides. |
| `/api/mic-content` | POST | admin | Save `{ key, lang, value }`. Debounced autosave. |
| `/api/mic-content/public` | GET | public | Public read for server-side rendering (incl. toggles). |
| `/api/mic-images/upload` | POST | admin | Multipart. `?slot=…&variant=desktop\|tablet\|mobile\|default`. Validates, resizes, uploads to Blob, upserts row. |
| `/api/mic-images/[slot]` | DELETE | admin | Delete row. Optional `?variant=`. |
| `/api/mic-images` | GET | public | Returns `{ hero: { desktop, tablet, mobile, default }, day22Bg: { default }, … }`. |
| `/api/guests/[id]/generate-mic-token` | POST | admin | Generate nanoid(12), persist, return URL. |
| `/api/mic-rsvp` | POST | public (mic_token) | Insert/update row in `mic_rsvps`. |

## 7. Components

- `components/MicInvitation.tsx` — top-level MIC page (client).
- `components/MicHeroImage.tsx` — `<picture>` with 3 breakpoint variants + fallbacks.
- `components/MicSectionBackground.tsx` — slot-aware bg or placeholder.
- `components/MicCurtainFrame.tsx` — proscenium frame, toggleable.
- `components/MicPetalOverlay.tsx` — red rose particles, toggleable.
- `components/MicHamburgerMenu.tsx` — top-right menu.
- `components/MicRsvpForm.tsx` — reuses `ConfettiCelebration`.
- `app/[lang]/marriage-invitation/[token]/page.tsx` — server component.
- `app/admin/mic/*` — admin MIC tab components.

Reused: `invitation-helpers` (`Section`/`FadeIn`/`BgPhoto`/`useInView`), `ConfettiCelebration`.

Not used on MIC: `LanguageToggle`, `EnvelopeAnimation`, `MandalaDecor`, `MusicPlayer`.

## 8. Dependencies

- `@vercel/blob` — image storage.
- `sharp` — server-side image resize.

Env var: `BLOB_READ_WRITE_TOKEN` (user provisions in Vercel dashboard).

## 9. Toggles (admin kill-switches)

Two independent boolean content keys stored in `mic_content`:

| Key | Default | Effect when OFF |
|---|---|---|
| `micEnableCurtain` | `true` | No curtain, no opening animation, hero shown immediately. |
| `micEnablePetals` | `true` | No red rose overlay. |

Why two: curtain and petals are visually distinct. If one feels heavy on an older device, we can kill just that one. Also lets us A/B visually without a redeploy.

`prefers-reduced-motion: reduce` is independent and always wins.

Full decision matrix in `Wireframes.md §G`.

## 10. Breakpoints

| Range | Label | Fringe/side | Hero image variant |
|---|---|---|---|
| ≤480 px | Mobile | 6% | `hero.mobile` → `hero.default` → baked |
| 481–1024 px | iPad | 10% | `hero.tablet` → `hero.default` → baked |
| >1024 px | Desktop | 15% | `hero.desktop` → `hero.default` → baked |

Mobile-first CSS; iPad and desktop are progressive enhancements via media queries.

## 11. Migration (manual)

```sql
-- 1. Guests column
ALTER TABLE guests ADD COLUMN IF NOT EXISTS mic_token varchar(12) UNIQUE;

-- 2. MIC content
CREATE TABLE IF NOT EXISTS mic_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key varchar(60) NOT NULL,
  lang varchar(2) NOT NULL DEFAULT 'de',
  value text NOT NULL,
  updated_at timestamp NOT NULL DEFAULT now(),
  CONSTRAINT mic_content_key_lang_unique UNIQUE (key, lang)
);

-- 3. MIC images
CREATE TABLE IF NOT EXISTS mic_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot varchar(40) NOT NULL,
  variant varchar(20) NOT NULL DEFAULT 'default',
  url text NOT NULL,
  uploaded_at timestamp NOT NULL DEFAULT now(),
  CONSTRAINT mic_images_slot_variant_unique UNIQUE (slot, variant)
);

-- 4. MIC RSVPs
CREATE TABLE IF NOT EXISTS mic_rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id uuid NOT NULL REFERENCES guests(id),
  attending_22 boolean,
  attending_23 boolean,
  address text,
  note text,
  submitted_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),
  CONSTRAINT mic_rsvps_guest_unique UNIQUE (guest_id)
);
```

All additive. Zero risk to existing data.

## 12. Testing checklist (post-deploy)

### Guest flows
- [ ] `'22+23'` guest sees all 6 sections.
- [ ] `'23'` guest skips 22 Jan block entirely.
- [ ] Kolkata guest: `/admin` doesn't offer MIC button.
- [ ] Invalid `mic_token` → nice 404 page.
- [ ] MIC RSVP submit creates row; resubmit updates same row.
- [ ] Hamburger "Save-the-Date öffnen" opens STD in new tab.

### Responsive
- [ ] 375 px (mobile Safari): fringes ~22 px, content ~330 px, hero mobile variant served.
- [ ] 768 px (iPad portrait): fringes ~77 px, hero tablet variant served.
- [ ] 1024 px (iPad landscape): fringes ~102 px.
- [ ] 1280 px (desktop): fringes ~192 px, hero desktop variant served.
- [ ] Baked image used when no admin upload exists.

### Admin
- [ ] Three tabs render.
- [ ] "MIC-Link generieren" works per Berlin guest card.
- [ ] Three hero upload slots work; others single-slot.
- [ ] Text edits autosave after ~5 s.
- [ ] Toggle `micEnableCurtain` OFF → curtain gone from MIC.
- [ ] Toggle `micEnablePetals` OFF → petals gone from MIC.
- [ ] Both OFF → plain MIC renders.
- [ ] CSV/PDF export includes MIC columns.

### Accessibility
- [ ] `prefers-reduced-motion: reduce` → curtain static, no petals.
- [ ] Fringes don't block taps (`pointer-events: none`).
- [ ] Content text available to screen readers from frame 0.

### No regressions
- [ ] STD link still works, STD RSVP still works.
- [ ] Hindu invite + Hindu RSVP still work.
- [ ] Berlin OG + Hindu OG images still work.

## 13. Deferred (future commits)

- J♥S monogram embroidered on closed curtains.
- "A Thousand Years" theme music.
- Scroll-driven curtain re-fold.
- MIC OG image (per-guest preview on share).
- English / Bengali versions.
- Admin crop UI (focal-point selector).
- Admin ability to add/remove image slots.
- Floral corner decorations (Luciano-style) — dropped since baked hero carries that aesthetic.

## 14. Open items for implementation phase

1. Final MIC key names in `mic_content`.
2. German default text for each key (pull from `Specifications.md`).
3. `/de/marriage-invitation/[token]` vs `/marriage-invitation/[token]`.
4. Placeholder visual design (burgundy gradient tone, label font).
5. Hamburger icon style.
6. FAQ deadline card accent (border, pulse?).
7. Timetable formatting — textarea vs structured.

---

## Summary of what changes

| Area | Change |
|---|---|
| Routes | +1 new: `/[lang]/marriage-invitation/[mic_token]`. Existing routes untouched. |
| DB | +1 column (`guests.mic_token`). +3 tables (`mic_content`, `mic_images`, `mic_rsvps`). All additive. |
| API | +8 new routes under `/api/mic-*`. Existing APIs untouched. |
| Components | +7 new. Reuses `invitation-helpers` + `ConfettiCelebration`. |
| Admin UI | Top tabs: 2 → 3. Guest cards: new MIC link + RSVP row (Berlin only). MIC Content tab with 8 image slots, text groups, 2 toggles. |
| Dependencies | +2: `@vercel/blob`, `sharp`. |
| Env vars | +1: `BLOB_READ_WRITE_TOKEN`. |
| STD | Zero changes. |
| Hindu wedding flow | Zero changes. |
