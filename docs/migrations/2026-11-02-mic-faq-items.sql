-- MIC variable FAQ list — 2026-11-02
--
-- Apply manually against prod Neon. DO NOT run `drizzle-kit push`.
--
-- Replaces the 10 hardcoded `micFaq*Title`/`micFaq*Body` keys in `mic_content`
-- with a proper table so admin can add/remove/reorder questions and flag any
-- of them as "important" (same yellow-glow treatment the deadline card used).
--
-- Safe to re-run: the CREATE uses IF NOT EXISTS and the INSERT is guarded by
-- a NOT EXISTS check so defaults are only seeded on the first run.

BEGIN;

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

-- 2. Seed the 5 current FAQs (same text that was baked into lib/mic.ts).
--    Only runs if the table is empty — safe to re-run.
INSERT INTO mic_faq_items (position, title, body, is_important)
SELECT * FROM (VALUES
  (0,
   'Was sollen wir anziehen?',
   E'So bunt und vielfältig wie unsere Gäste! Ob klassisch-elegante Hochzeitsgarderobe oder traditionelle indische Festkleidung — bei uns ist alles herzlich willkommen.\n\nBitte vermeidet nur drei Farben:\n🤍 Weiß — der Braut vorbehalten.\n❤️ Rot — in der bengalischen Hochzeitstradition ebenfalls der Braut vorbehalten.\n🖤 Schwarz — das überlassen wir der Trauer.\n\nAnsonsten: Seid festlich, seid farbenfroh und vor allem seid ihr selbst!',
   false),
  (1,
   'Was wünscht ihr euch?',
   'Das größte Geschenk ist für uns, diesen besonderen Tag mit euch zu feiern! Unser Zuhause ist bereits gut gefüllt. Wenn ihr uns dennoch eine Freude machen möchtet, freuen wir uns über einen kleinen Beitrag zu unserer Flitterwochenkasse — so schenkt ihr uns unvergessliche gemeinsame Erinnerungen.',
   false),
  (2,
   'Sind Kinder willkommen?',
   'Wir lieben Kinder! Dennoch ist unsere Hochzeitsfeier in erster Linie für Erwachsene geplant — vor Ort gibt es keine Kinderbetreuung und keine Spielangebote. Wenn ihr für euren Nachwuchs eine liebevolle Betreuung organisieren könnt, würde uns das sehr freuen. Falls das nicht möglich ist, sprecht uns bitte persönlich an — wir finden gemeinsam eine Lösung.',
   false),
  (3,
   'Bis wann müssen wir zusagen?',
   E'Damit wir gut planen können, bitten wir Euch um Eure Rückmeldung bis spätestens **15. Januar 2027**. Die Rückmeldung könnt ihr direkt über diese Seite abgeben. Sollten wir bis zum 15. Januar keine Nachricht erhalten, gehen wir leider von einer Absage aus. Vielen Dank für Euer Verständnis!',
   true),
  (4,
   'Dürfen wir Fotos und Videos machen?',
   E'Unbedingt! Haltet unsere Hochzeit gerne aus eurer persönlichen Perspektive fest.\n\nAmazon Photos: Link folgt — hier könnt ihr eure schönsten Bilder hochladen und die Erinnerungen der anderen Gäste entdecken.\n\nWhatsApp: Teilt eure Aufnahmen gerne in unserer WhatsApp-Gruppe oder schickt sie uns direkt. Über kleine Videobotschaften freuen wir uns besonders.',
   false)
) AS defaults(position, title, body, is_important)
WHERE NOT EXISTS (SELECT 1 FROM mic_faq_items);

-- 3. Clean up the old hardcoded FAQ overrides from mic_content.
--    They're no longer read; this keeps the table tidy.
DELETE FROM mic_content WHERE key IN (
  'micFaqDressCodeTitle',    'micFaqDressCodeBody',
  'micFaqGiftsTitle',        'micFaqGiftsBody',
  'micFaqChildrenTitle',     'micFaqChildrenBody',
  'micFaqRsvpDeadlineTitle', 'micFaqRsvpDeadlineBody',
  'micFaqPhotosTitle',       'micFaqPhotosBody'
);

COMMIT;

-- Verify:
--   SELECT position, title, is_important FROM mic_faq_items ORDER BY position;
--   -- Expect 5 rows; "Bis wann müssen wir zusagen?" is_important=true.
