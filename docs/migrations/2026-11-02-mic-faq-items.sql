-- MIC variable FAQ list — 2026-11-02
--
-- Apply manually against prod Neon. DO NOT run `drizzle-kit push`.
--
-- Replaces the 10 hardcoded `micFaq*Title`/`micFaq*Body` keys in `mic_content`
-- with a proper table so admin can add/remove/reorder questions and flag any
-- of them as "important" (same yellow-glow treatment the deadline card used).
--
-- To apply:
--   1. Open Neon console → the `neondb` database.
--   2. Run statement 1 (CREATE TABLE). Verify with
--        SELECT table_name FROM information_schema.tables WHERE table_name='mic_faq_items';
--   3. (Optional cleanup) run statement 2 to drop the now-unused mic_content rows.
--      Safe to skip — the app ignores unknown keys. Run it only after the new
--      code is deployed and you've confirmed the FAQ section renders from the
--      new table.

-- 1. mic_faq_items — one row per FAQ card, ordered by `position`.
CREATE TABLE IF NOT EXISTS mic_faq_items (
  id            uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  position      integer NOT NULL,
  title         text    NOT NULL,
  body          text    NOT NULL,
  is_important  boolean NOT NULL DEFAULT false,
  created_at    timestamp NOT NULL DEFAULT now(),
  updated_at    timestamp NOT NULL DEFAULT now()
);

-- 2. OPTIONAL — drop the old hardcoded FAQ overrides from mic_content.
-- Only run after the new code is live. These keys are no longer read.
-- DELETE FROM mic_content WHERE key IN (
--   'micFaqDressCodeTitle', 'micFaqDressCodeBody',
--   'micFaqGiftsTitle',     'micFaqGiftsBody',
--   'micFaqChildrenTitle',  'micFaqChildrenBody',
--   'micFaqRsvpDeadlineTitle', 'micFaqRsvpDeadlineBody',
--   'micFaqPhotosTitle',    'micFaqPhotosBody'
-- );
