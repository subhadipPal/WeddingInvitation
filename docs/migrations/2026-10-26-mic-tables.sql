-- MIC (Marriage Invitation Card) migration — 2026-10-26
--
-- Apply this manually against prod Neon. DO NOT run `drizzle-kit push` — see
-- memory file feat-hindu-wedding.md for the reason (truncate risk on the
-- content table over an unrelated unique-constraint diff).
--
-- All statements are additive. Zero risk to existing data.
--
-- To apply:
--   1. Open Neon console → the `neondb` database (ep-ancient-glade-b1diczz8, eu-central-1)
--   2. Paste these 4 statements one at a time, run each, verify success.
--   3. Verify: SELECT column_name FROM information_schema.columns WHERE table_name='guests';
--              SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'mic_%';

-- 1. guests.mic_token — nullable, unique when set.
ALTER TABLE guests
  ADD COLUMN IF NOT EXISTS mic_token varchar(12) UNIQUE;

-- 2. mic_content — same shape as `content` but scoped to MIC.
CREATE TABLE IF NOT EXISTS mic_content (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key        varchar(60) NOT NULL,
  lang       varchar(2)  NOT NULL DEFAULT 'de',
  value      text        NOT NULL,
  updated_at timestamp   NOT NULL DEFAULT now(),
  CONSTRAINT mic_content_key_lang_unique UNIQUE (key, lang)
);

-- 3. mic_images — one URL per (slot, variant). Only `hero` uses non-default variants.
CREATE TABLE IF NOT EXISTS mic_images (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot        varchar(40) NOT NULL,
  variant     varchar(20) NOT NULL DEFAULT 'default',
  url         text        NOT NULL,
  uploaded_at timestamp   NOT NULL DEFAULT now(),
  CONSTRAINT mic_images_slot_variant_unique UNIQUE (slot, variant)
);

-- 4. mic_rsvps — one RSVP per guest, separate from the STD rsvps table.
CREATE TABLE IF NOT EXISTS mic_rsvps (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id      uuid NOT NULL REFERENCES guests(id),
  attending_22  boolean,
  attending_23  boolean,
  address       text,
  note          text,
  submitted_at  timestamp NOT NULL DEFAULT now(),
  updated_at    timestamp NOT NULL DEFAULT now(),
  CONSTRAINT mic_rsvps_guest_unique UNIQUE (guest_id)
);
