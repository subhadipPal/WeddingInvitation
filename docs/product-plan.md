# Invitely — Event Page Builder: Product Plan

**Date:** 2026-10-29  
**Status:** Ideation / Pre-build

---

## Concept

A general-purpose event page builder for weddings, engagements, baby showers, birthdays, corporate launches — any event that needs a beautiful, shareable page. Fully customisable: fonts, colors, sections, maps, page length. Multi-language. RSVP built in.

**Tagline:** *Beautiful event pages. In minutes.*

---

## What We Already Have (Unfair Advantage)

| Already built in WeddingInvitation repo | Reuse for product |
|---|---|
| Bilingual DE/EN content system | Multi-language support per event |
| Admin page with live content editing | Tenant admin panel |
| Image upload → Vercel Blob | Per-tenant media storage |
| RSVP system with DB | Built-in RSVP for every event |
| Scroll-snap full-screen sections | Core page builder primitive |
| Animations (curtain, snowflakes) | Template "effects" library |
| MIC token-per-guest system | Personalised guest links |
| OG image generation | Auto social preview per event |

---

## Architecture

### Section-Based Page Builder

The page is an **ordered list of sections**. Each section has a type, content config, and inherits the global theme. The admin can add, remove, reorder, and configure each section independently.

```ts
type Section =
  | { type: 'hero';      config: HeroConfig }
  | { type: 'countdown'; config: CountdownConfig }
  | { type: 'details';   config: DetailsConfig }    // date, time, venue
  | { type: 'map';       config: MapConfig }         // embed Google/OSM map
  | { type: 'gallery';   config: GalleryConfig }
  | { type: 'timetable'; config: TimetableConfig }
  | { type: 'rsvp';      config: RSVPConfig }
  | { type: 'message';   config: MessageConfig }     // freeform rich text
  | { type: 'closing';   config: ClosingConfig }

type EventPage = {
  tenantId: string
  sections: Section[]     // ordered — drag to reorder
  theme: ThemeConfig      // global font pair, colors
}
```

### Database Schema

```sql
-- Core tenant table
tenants
  id            uuid PK
  slug          text UNIQUE   -- "subhadip-julia" → /e/subhadip-julia
  owner_email   text
  hashed_pw     text
  plan          text          -- 'free' | 'starter' | 'premium'
  event_type    text          -- 'wedding' | 'birthday' | 'corporate' | ...
  created_at    timestamptz

-- Page structure (sections + theme as JSON documents)
event_pages
  tenant_id     uuid PK FK → tenants
  sections      jsonb         -- ordered Section[] array
  theme         jsonb         -- ThemeConfig
  updated_at    timestamptz

-- Images
event_images
  tenant_id     uuid FK
  slot          text          -- 'hero', 'closing', 'gallery_1', ...
  variant       text
  url           text          -- Vercel Blob URL
  uploaded_at   timestamptz

-- Guests + RSVP (generalised from existing mic_guests / mic_rsvps)
event_guests
  id            uuid PK
  tenant_id     uuid FK
  name          text
  token         text UNIQUE

event_rsvps
  tenant_id     uuid FK
  guest_id      uuid FK
  ...
```

The existing `micContent`, `micImages`, `guests`, `micRsvps` tables are this schema scoped to a single hardcoded tenant. Migration = add `tenant_id` everywhere.

### ThemeConfig

```ts
type ThemeConfig = {
  fontHeading:   string   // 'Playfair Display' | 'Cormorant' | ...
  fontBody:      string   // 'Lato' | 'Inter' | 'Source Serif' | ...
  colorPrimary:  string   // accent, headings, dividers
  colorBg:       string   // page background
  colorText:     string   // body text
  colorSurface:  string   // card/section backgrounds
  darkMode:      boolean
}
```

Curated font pairs (6–8 options) loaded via Google Fonts at build time per tenant to avoid layout shift.

### Map Section

```ts
type MapConfig = {
  provider:       'openstreetmap' | 'google-embed'
  lat:            number
  lng:            number
  zoom:           number
  label:          string
  directions_url: string  // deep-link to Google Maps / Apple Maps
}
```

Admin types an address → geocoded via Nominatim (free, no API key) → pin placed → fine-tune zoom. Rendered as an `<iframe>` embed — no billing until high volume.

### URL Structure

- **Phase 1 (path-based):** `invitely.com/e/subhadip-julia`
- **Phase 2 (subdomain):** `subhadip-julia.invitely.com` — Vercel wildcard subdomain, tenant resolved from `req.headers.host`

---

## Admin UI

```
┌─────────────────────┬──────────────────────────────────┐
│  SECTIONS           │                                  │
│  ─────────────────  │     LIVE PREVIEW                 │
│  ☰ Hero        👁   │                                  │
│  ☰ Details     👁   │   ┌──────────────────────────┐  │
│  ☰ Map         👁   │   │   Julia & Subhadip       │  │
│  ☰ Gallery     👁   │   │   22 January 2027        │  │
│  ☰ RSVP        👁   │   └──────────────────────────┘  │
│  ☰ Closing     👁   │                                  │
│                     │                                  │
│  + Add Section      │                                  │
│                     │                                  │
│  THEME              │                                  │
│  Font: Playfair     │                                  │
│  Color: [■] #c9a84c │                                  │
│  Bg:    [■] #3a0808 │                                  │
└─────────────────────┴──────────────────────────────────┘
```

- Left panel: section list (drag to reorder, toggle visibility, add, delete)
- Right panel: live preview
- Click a section → right panel shows that section's config form
- **The guest page renderer is simple. The admin UI is the product.**

---

## Monetisation

| Tier | Price | What's included |
|---|---|---|
| Free | €0 | 1 event page, `/e/slug` URL, 50 guests, 3 image slots, default template |
| Starter | €29 one-time | Custom domain (CNAME), 500 guests, all image slots, all templates + theme |
| Premium | €79 one-time | + Multi-language, per-guest personalised URLs, RSVP analytics, priority support |
| Bespoke | €200+ | Hand-built custom design, delivered in 3–5 days |

Payment: **Stripe Checkout** (one-time) or Lemon Squeezy (simpler EU VAT handling).

On payment webhook → provision tenant → email credentials.

---

## Build Order

### Phase 1 — Validate demand (Week 1)
- [ ] Product domain (separate from juliaundsubhadip.xyz)
- [ ] Landing page: headline, live demo link (current MIC), pricing table, email capture
- [ ] No product yet — validate demand first

### Phase 2 — Multi-tenant core (Weeks 2–3)
- [ ] `tenants` + `event_pages` tables with `sections jsonb` + `theme jsonb`
- [ ] `/e/[slug]` route: reads sections array, renders each `<SectionComponent>`
- [ ] Tenant registration: sign up → get `/e/your-slug` with default content
- [ ] Tenant admin: theme panel (color pickers, font selector, live CSS vars)
- [ ] Tenant admin: section list (add/remove/reorder, visibility toggle)
- [ ] Tenant admin: per-section config forms

### Phase 3 — Features (Week 4)
- [ ] Map section (Nominatim geocode + iframe embed)
- [ ] Gallery section (grid/masonry/carousel layouts)
- [ ] Stripe payment → unlock Starter tier

### Phase 4 — Growth (Ongoing)
- [ ] SEO: target "digitale Hochzeitseinladung", "wedding invitation website", "Save the Date website"
- [ ] Blog: "How to create a digital wedding invitation", "Save the Date ideas 2027"
- [ ] Schema markup (WeddingEvent structured data)
- [ ] Public gallery of anonymised past event pages
- [ ] Custom domain support (CNAME → platform)
- [ ] Subdomain per tenant (`slug.invitely.com`)

---

## SEO Strategy

- Target DE + EN keywords (bilingual content already in our DNA)
- Core pages: landing, pricing, blog, showcase gallery, demo
- Structured data: `Event`, `WeddingEvent` schema.org types on each event page
- Fast Core Web Vitals (Next.js + Vercel already covers this)
- Each tenant event page = indexed content (unless tenant sets `noindex`)

---

## Open Questions

- Product domain name (Invitely, Pageant, Fête, Eventio, Cerimonia, …?)
- Self-serve vs request-based for Bespoke tier?
- Multi-tenant on this repo vs new repo?
- Neon org account needed for per-tenant DB projects vs shared DB with `tenant_id`?
