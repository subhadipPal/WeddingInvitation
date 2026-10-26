# MIC — Wireframes (ASCII, mobile-first)

**Companion to:** `docs/superpowers/plans/2026-10-26-marriage-invitation-card.md`
**Scope:** low-fidelity wireframes for every MIC screen + every admin change.
**Priority:** mobile first (≤480 px) → iPad (481–1024 px) → desktop (>1024 px).
**Everything visual is modular and admin-toggleable.** See §G for the toggles.

**Reading key:**

```
┌────┐  Hard edge      ░  Background image
│    │  Container      █  Primary action
▓▓▓▓    Curtain fabric ❄  Red rose petal
───     Divider        ▒  Placeholder (no image uploaded)
```

---

## Part A — Guest-facing MIC page

**Route:** `/[lang]/marriage-invitation/[mic_token]`
**Language:** German only.
**Scroll pattern:** scroll-snap, same as `ScrollInvitation`.
**Guest branches:** `'22+23'` sees all 6 sections. `'23'` skips the 22 Jan block.

### A.1 Section map

```
                       '22+23' guest            '23' only guest
Section 1              ▓ Hero                   ▓ Hero
Section 2              ▓ 22 Jan block           ─ (skipped)
Section 3              ▓ 23 Jan block           ▓ 23 Jan block
Section 4              ▓ FAQ                    ▓ FAQ
Section 5              ▓ RSVP                   ▓ RSVP
Section 6              ▓ Closing                ▓ Closing
```

### A.2 Section 1 — Hero

**Image:** `public/photos/MIC/MIC_home.jpeg` baked default. "JULIA & SUBHADIP" + "BERLIN MEETS BENGAL" are part of the pixels — NOT HTML text. Only the date is overlaid as HTML.

Admin can override with uploaded variants (mobile, tablet, desktop) in Vercel Blob.

```
┌──┬──────────────────────────────────────┬──┐
│▓▓│░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ·❄· ·░[≡]│▓▓│  ← hamburger top-right
│▓▓│░░░░░░ (red rose petals ❄ ) ░░░░░░░░░│▓▓│
│▓▓│░░ (baked image: title + couple +  ░░│▓▓│
│▓▓│░░  Berlin villa + Kolkata temple)   │▓▓│
│▓▓│░░░░ 22. und 23. Januar 2027 ░░░░░░░░│▓▓│  ← micHeroDate overlay (gold)
│▓▓│░░░░░░░░░░░ ↓ scroll ↓ ░░░░░░░░░░░░░░│▓▓│
└──┴──────────────────────────────────────┴──┘
  ↑ 8% fringe          84% content       ↑ 8% fringe
   (mobile: ~30px on 375px screen)
```

**Hamburger panel** (opens on tap after curtain finishes):

```
             ┌────────────────────────┐
             │ Save-the-Date öffnen → │  ← opens STD in new tab
             └────────────────────────┘
```

### A.3 Section 2 — 22 Jan block (hidden from `'23'` guests)

```
┌──┬──────────────────────────────────────┬──┐
│▓▓│░░░░░░░░░░░░ FREITAG ░░░░░░░░░░░░░░░░│▓▓│
│▓▓│░░░░░░ 22. Januar 2027 ░░░░░░░░░░░░░░│▓▓│
│▓▓│░░░ Liebe/r {Guest.name}, ░░░░░░░░░░░│▓▓│
│▓▓│░░░ (mic22Body or mic22BodyMulti) ░░░│▓▓│
│▓▓│░░ ┌──────────────────────────────┐ ░│▓▓│
│▓▓│░░ │ ⏰ ABLAUF                     │ ░│▓▓│
│▓▓│░░ │ 11:15–13:00 Schedule          │ ░│▓▓│  ← mic22Timetable
│▓▓│░░ └──────────────────────────────┘ ░│▓▓│
│▓▓│░░ ┌──────────────────────────────┐ ░│▓▓│
│▓▓│░░ │ 📍 HOCHZEITSVILLA ZEHLENDORF │ ░│▓▓│  ← mic22VenueVilla
│▓▓│░░ │ [ Route planen → ]           │ ░│▓▓│
│▓▓│░░ └──────────────────────────────┘ ░│▓▓│
│▓▓│░░ ┌──────────────────────────────┐ ░│▓▓│
│▓▓│░░ │ 📍 ZEHLENDORFER HOF          │ ░│▓▓│  ← mic22VenueHof
│▓▓│░░ │ [ Route planen → ]           │ ░│▓▓│
│▓▓│░░ └──────────────────────────────┘ ░│▓▓│
└──┴──────────────────────────────────────┴──┘
```

**On iPad+ (≥481px):** two venue cards side-by-side instead of stacked.

### A.4 Section 3 — 23 Jan block (shown to everyone)

```
┌──┬──────────────────────────────────────┬──┐
│▓▓│░░░░░░░░░░░░ SAMSTAG ░░░░░░░░░░░░░░░░│▓▓│
│▓▓│░░░░░░ 23. Januar 2027 ░░░░░░░░░░░░░░│▓▓│
│▓▓│░░░ Berlin meets Bengal ░░░░░░░░░░░░░│▓▓│
│▓▓│░░░ (mic23Body) ░░░░░░░░░░░░░░░░░░░░░│▓▓│
│▓▓│░░ ┌──────────────────────────────┐ ░│▓▓│
│▓▓│░░ │ ⏰ ABLAUF (14:00 → dance)     │ ░│▓▓│  ← mic23Timetable
│▓▓│░░ └──────────────────────────────┘ ░│▓▓│
│▓▓│░░ ┌──────────────────────────────┐ ░│▓▓│
│▓▓│░░ │ 📍 ESSZIMMER MAHLSDORF       │ ░│▓▓│  ← mic23Venue
│▓▓│░░ │ [ Route planen → ]           │ ░│▓▓│
│▓▓│░░ └──────────────────────────────┘ ░│▓▓│
└──┴──────────────────────────────────────┴──┘
```

### A.5 Section 4 — FAQ

```
┌──┬──────────────────────────────────────┬──┐
│▓▓│░░░░░░ HÄUFIGE FRAGEN ░░░░░░░░░░░░░░░│▓▓│
│▓▓│░░ ┌ Was anziehen?    ──────┐ ░░░░░░│▓▓│  ← micFaqDressCode
│▓▓│░░ └─────────────────────────┘ ░░░░░░│▓▓│
│▓▓│░░ ┌ Was wünscht ihr euch? ──┐ ░░░░░│▓▓│  ← micFaqGifts
│▓▓│░░ └─────────────────────────┘ ░░░░░░│▓▓│
│▓▓│░░ ┌ Sind Kinder willkommen? ┐ ░░░░░│▓▓│  ← micFaqChildren
│▓▓│░░ └─────────────────────────┘ ░░░░░░│▓▓│
│▓▓│░░ ┌══════════════════════════┐ ░░░░│▓▓│  ← micFaqRsvpDeadline (accent)
│▓▓│░░ ║ ⚠ Bis zum 15. Januar 2027 ║ ░░░│▓▓│
│▓▓│░░ └══════════════════════════┘ ░░░░│▓▓│
│▓▓│░░ ┌ Fotos? Amazon + WhatsApp ┐ ░░░░│▓▓│  ← micFaqPhotos
│▓▓│░░ └─────────────────────────┘ ░░░░░░│▓▓│
└──┴──────────────────────────────────────┴──┘
```

**Deadline card** uses thicker gold border + warm highlight — this is the one guests must read.

### A.6 Section 5 — RSVP (optional)

```
┌──┬──────────────────────────────────────┬──┐
│▓▓│░░░░░░ RÜCKMELDUNG ░░░░░░░░░░░░░░░░░░│▓▓│
│▓▓│░░ Liebe/r {Guest.name}, ░░░░░░░░░░░░│▓▓│
│▓▓│░░ ┌──────────────────────────────┐ ░│▓▓│  (only for '22+23')
│▓▓│░░ │ Am 22. Januar dabei?         │ ░│▓▓│
│▓▓│░░ │  [  Ja  ]      [  Nein  ]    │ ░│▓▓│
│▓▓│░░ └──────────────────────────────┘ ░│▓▓│
│▓▓│░░ ┌──────────────────────────────┐ ░│▓▓│
│▓▓│░░ │ Am 23. Januar dabei?         │ ░│▓▓│
│▓▓│░░ │  [  Ja  ]      [  Nein  ]    │ ░│▓▓│
│▓▓│░░ └──────────────────────────────┘ ░│▓▓│
│▓▓│░░ Adresse: [ ___ ]  (optional)      │▓▓│
│▓▓│░░ Notiz:   [ ___ ]  (optional)      │▓▓│
│▓▓│░░░░░ [ █ Rückmeldung senden █ ] ░░░░│▓▓│
└──┴──────────────────────────────────────┴──┘
```

Everything optional. Submit disabled only if **all** fields empty. On success → confetti + status flip to "Vielen Dank". Resubmit updates same row (UNIQUE on `guest_id` in `mic_rsvps`).

### A.7 Section 6 — Closing

```
┌──┬──────────────────────────────────────┬──┐
│▓▓│░░░░░ Wir freuen uns auf euch ░░░░░░░│▓▓│  ← micClosingBody
│▓▓│░░░░░░░░ Julia & Subhadip ░░░░░░░░░░░│▓▓│  ← micClosingSign
└──┴──────────────────────────────────────┴──┘
```

### A.8 Placeholder (any slot missing an image)

```
┌─────────────────────────────────────────┐
│▒▒ (Bild wird noch hochgeladen) ▒▒▒▒▒▒▒▒│  ← cream text on burgundy gradient
└─────────────────────────────────────────┘
```

### A.9 Invalid token

```
┌─────────────────────────────────────────┐
│░░░░░ Julia & Subhadip ░░░░░░░░░░░░░░░░░│
│░░ Diese Einladung ist ungültig. ░░░░░░░│
└─────────────────────────────────────────┘
```

Pattern reused from STD invalid-token page.

---

## Part B — Admin changes

### B.1 Tab bar

**Before:** `Guests | Content`
**After:** `Guests | Save-the-Date Content | Marriage-Invitation Content`

### B.2 Guest card — Berlin guest

```
┌─ Guest card ────────────────────────────┐
│  ⓡ   Rakesh                 [× Delete] │
│  [ ✉ CONTACT ]  [ 📅 22–23 Jan ]        │
│  [ STD RSVP 22 — ]  [ STD RSVP 23 — ]  │
│  [ MIC RSVP 22 ✓ ]  [ MIC RSVP 23 ✓ ]  │  ← NEW
│  [ 🔗 STD-Links ]   [ DE ]  [ EN ]      │
│  [ 💍 MIC-Link ]    [ generieren ]      │  ← NEW
└──────────────────────────────────────────┘
```

**Kolkata guest** (`'28'`): no MIC row at all.

### B.3 Stats bar

Unchanged. "Confirmed" extends to count MIC RSVPs as well as STD RSVPs.

### B.4 Save-the-Date Content tab

Identical to current `Content` tab. Hindu group stays here. Zero restructure.

### B.5 Marriage-Invitation Content tab

German-only. Debounced autosave (5s), reused from STD content tab.

```
┌─ Images (admin uploads to Vercel Blob) ─┐
│  Hero — Desktop (≥1025px)   [ Hochladen ]
│  Hero — Tablet  (481–1024)  [ Hochladen ]
│  Hero — Mobile  (≤480)      [ Hochladen ]
│  22 Jan background          [ Hochladen ]
│  23 Jan background          [ Hochladen ]
│  FAQ background             [ Hochladen ]
│  RSVP background            [ Hochladen ]
│  Closing background         [ Hochladen ]
│
├─ Text (German) ─────────────────────────┤
│  Hero:         micHeroDate               │
│  22 Jan:       mic22Body, mic22BodyMulti,│
│                mic22Timetable, …          │
│  23 Jan:       mic23Body, mic23BodyMulti,│
│                mic23Timetable, …          │
│  FAQ:          micFaqDressCode, …,       │
│                micFaqRsvpDeadline, …      │
│  RSVP labels:  micRsvpGreeting, …         │
│  Closing:      micClosingBody,            │
│                micClosingSign             │
│
├─ Toggles (see §G) ──────────────────────┤
│  [x] Curtain + animations                │
│  [x] Red rose petal overlay              │
│
│                           [Reset defaults]
└──────────────────────────────────────────┘
```

### B.6 Image upload — admin-side flow

```
Pick file → client validates (JPEG/PNG/WEBP, ≤5 MB)
          → POST /api/mic-images/upload?slot=hero&variant=mobile
          → server (Node): revalidate → sharp resize ≤1600px wide, q=82
          → put() to Vercel Blob → upsert mic_images row (slot, variant)
          → return { url }
          → client swaps thumbnail preview (no reload)
```

Errors show inline next to the slot ("Datei zu groß", "Falsches Format", "Fehlgeschlagen").

### B.7 CSV + PDF export — new columns

```
… STD cols …, MIC RSVP 22, MIC RSVP 23, MIC Address, MIC Note, MIC Token, MIC Link
```

---

## Part C — User flows

### C.1 Guest opens MIC link

```
WhatsApp → /de/marriage-invitation/{mic_token}
    → server resolves guest by mic_token
    → load mic_content (DE) + mic_images (grouped by slot, variant) + existing mic_rsvp
    → render → curtain opens (3s) → content revealed
    → guest scrolls through sections (22 Jan skipped if '23' only)
    → RSVP optional → submit → mic_rsvps upserted (unique on guest_id)
```

### C.2 Admin generates MIC links

```
Admin → Guests tab → per Berlin guest card:
    "generieren" → POST /api/guests/{id}/generate-mic-token
    → nanoid(12), ensure unique, UPDATE guests SET mic_token=
    → UI shows link → "Kopieren" → paste into WhatsApp
```

### C.3 Admin uploads a hero image for mobile

```
Admin → MIC Content tab → "Hero — Mobile" slot → [ Hochladen ]
    → pick file → upload progress → thumbnail updates
    → MIC page on mobile now serves the uploaded variant
    → desktop + tablet still fall back to baked default
```

---

## Part D — Component tree

```
app/[lang]/marriage-invitation/[token]/page.tsx   (server)
  └── MicInvitation (client)
        ├── MicCurtainFrame      ← § F — toggleable
        ├── MicPetalOverlay      ← § F — toggleable, red rose petals
        ├── MicScrollContainer
        │     ├── Hero                — MicHeroImage (picture + 3 variants + baked)
        │     ├── Day22   (conditional)
        │     ├── Day23
        │     ├── FAQ
        │     ├── RSVP      — MicRsvpForm (reuses ConfettiCelebration)
        │     └── Closing
        └── MicHamburgerMenu     ← fades in after curtain
```

Reused: `invitation-helpers` (Section/FadeIn/BgPhoto/useInView), `ConfettiCelebration`.

Not used on MIC: `LanguageToggle`, `EnvelopeAnimation`, `MandalaDecor`, `MusicPlayer`.

---

## Part E — Open design items

Only visual + edge-case decisions. None block starting work.

1. Placeholder gradient colour — burgundy or lighter tone.
2. Hamburger icon style — three-line vs text "Menü".
3. FAQ deadline card accent — pulse animation on load?
4. Timetable formatting — single textarea with `\n` vs structured rows.
5. "Zur Einladung" scroll-to-top in menu — defer?
6. Hero `object-position` default — center 55% recommended.

---

## Part F — Curtain + petal overlay (optional, toggleable)

### F.1 Concept

The curtain is a **permanent proscenium frame** around all 6 sections:

- Covers viewport fully on load (content hidden).
- Opens over 3 s → stops at ±84% (mobile) / ±88% (iPad) / ±70% (desktop) travel.
- Fringes stay as thin fabric strips at left + right edges for the lifetime of the page.
- Red rose petals (`#8a1538`) fall continuously via one fixed overlay across all sections.

### F.2 Breakpoint strategy (mobile + iPad first)

| Viewport | Fringe width per side | Content width (375 px example) |
|---|---|---|
| ≤480 px (mobile) | 6% | 88% → ~330 px |
| 481–1024 px (iPad) | 10% | 80% → ~820 px on iPad landscape |
| >1024 px (desktop) | 15% | 70% |

Narrower fringes on mobile to protect screen real estate; wider on desktop for the theatrical proscenium feel.

### F.3 Slat styling (RED / GOLD / WHITE theme)

- 10 slats per panel, each 10% wide, `float: left` (or flex row).
- Alternating burgundy: `#4a0a0a` (odd) / `#3a0808` (even).
- `opacity: 0.8` — content behind faintly visible through the fabric.
- Pleated hem: `border-bottom-radius: 40px`.
- Gold inner edge (facing opening): 3 px `#c9a84c`.
- Cream outer highlight: 2 px `rgba(245,240,232,0.15)`.

### F.4 Opening animation

Pure CSS, no JS. `translate(0, 0)` → `translate(±84%|±88%|±70%, 0)` over 3 s linear with `fill-mode: forwards`. Hamburger + scroll arrow fade in at 3.1 s. One play per page load.

### F.5 Petal overlay

Ported from the vanilla-JS `Sakura` engine in `lucianofedericopereira/my-wedding`. Rewritten as a ~60-line React hook — no jQuery.

- 20 petals, randomised position + size + drift + duration + delay.
- Three stacked keyframes per petal: `fall` + `blow-soft|medium-left|right` + `sway-0..8`.
- Colour: solid `#8a1538` (deep rose red). Border-radius asymmetric for petal shape.
- Each petal self-removes on `animationend` if it's offscreen — no memory leak.
- 20 petals × compositor-only transforms = negligible mobile cost.

### F.6 Accessibility

- `aria-hidden` on all curtain + petal DOM.
- `pointer-events: none` on fringes + petals — taps near edges hit content.
- `prefers-reduced-motion: reduce` → curtain renders at final fringe position with no animation, petals hidden.
- Content behind curtain is in the DOM from frame 0 (SR/crawler friendly).

### F.7 Mobile perf budget

- 2 curtain panels × 10 slats + 20 petals = 42 extra DOM nodes.
- 22 compositor layers.
- Zero scroll repaints (everything `position: fixed`).
- Fits comfortably on low-end phones.

### F.8 Responsive hero image strategy

Three breakpoint variants in `mic_images` (slot=`hero`, variant=`mobile|tablet|desktop`), served via `<picture>` + `media` queries. Three-tier fallback:

1. Admin-uploaded breakpoint-specific variant in Vercel Blob (if present).
2. Admin-uploaded `default` variant in Vercel Blob (if present).
3. Baked file `public/photos/MIC/MIC_home.jpeg` (always present).

Other 5 slots: single upload per slot, variant always `default`. `<Image sizes>` + `object-fit: cover` handles their responsiveness.

Schema: `mic_images (slot, variant, url)` with `UNIQUE (slot, variant)`.

### F.9 Testing checklist

- [ ] Mobile Safari 375 px: curtain covers viewport, opens over 3 s, leaves ~22 px fringes.
- [ ] iPad portrait (768 px): fringes ~77 px, content ~614 px.
- [ ] iPad landscape (1024 px): fringes ~102 px, content ~820 px.
- [ ] Desktop 1280 px: fringes ~192 px, content ~896 px.
- [ ] Red rose petals visible on all 6 sections.
- [ ] Fringes don't move on scroll.
- [ ] Taps near fringe hit content underneath.
- [ ] Reduced motion → final fringe state, no animation, no petals.
- [ ] Admin toggles curtain OFF → curtain gone, petals gone, hero + content render directly.
- [ ] Admin toggles petals OFF but curtain ON → fringes shown, no petals.

---

## Part G — Toggles (admin kill-switches)

Two toggles stored in `mic_content` as boolean content keys (`'true'` / `'false'` strings):

| Key | Default | Effect when OFF |
|---|---|---|
| `micEnableCurtain` | `'true'` | `MicCurtainFrame` doesn't render. Hero image shows directly from first paint. Hamburger menu renders without fade-in delay. |
| `micEnablePetals` | `'true'` | `MicPetalOverlay` doesn't render. No red rose particles anywhere. |

Both default to ON. Admin can disable either independently in the MIC Content tab (two checkboxes at the bottom of the text groups).

Why two toggles not one: curtain and petals are visually distinct effects. If one looks heavy on an older device, we can kill just that one without losing the other. The pleated red curtain alone is already strong without petals; petals alone (no curtain) also works as a lighter option.

**`prefers-reduced-motion`** is independent — users who set the OS preference always skip animations regardless of admin toggles.

### G.1 Decision matrix

| curtain | petals | result |
|---|---|---|
| ON  | ON  | full MIC experience (default) |
| ON  | OFF | pleated curtain reveal + static page, no particles |
| OFF | ON  | no curtain reveal; red rose petals fall over content from page load |
| OFF | OFF | plain MIC — hero image + sections, nothing else moving. Fastest, safest fallback. |
