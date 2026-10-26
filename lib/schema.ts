import { pgTable, uuid, varchar, boolean, text, timestamp, unique } from 'drizzle-orm/pg-core'

export const guests = pgTable('guests', {
  id: uuid('id').primaryKey().defaultRandom(),
  token: varchar('token', { length: 12 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 200 }),
  phone: varchar('phone', { length: 30 }),
  invitedDays: varchar('invited_days', { length: 10 }).notNull(),
  isMulti: boolean('is_multi').notNull().default(false),
  isBengali: boolean('is_bengali').notNull().default(false),
  micToken: varchar('mic_token', { length: 12 }).unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const rsvps = pgTable('rsvps', {
  id: uuid('id').primaryKey().defaultRandom(),
  guestId: uuid('guest_id').notNull().references(() => guests.id),
  attending22: boolean('attending_22'),
  attending23: boolean('attending_23'),
  attending28: boolean('attending_28'),
  address: text('address'),
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

// ── MIC (Marriage Invitation Card) — separate from STD ────────────────────────

export const micContent = pgTable('mic_content', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: varchar('key', { length: 60 }).notNull(),
  lang: varchar('lang', { length: 2 }).notNull().default('de'),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => [unique().on(t.key, t.lang)])

export const micImages = pgTable('mic_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  slot: varchar('slot', { length: 40 }).notNull(),
  variant: varchar('variant', { length: 20 }).notNull().default('default'),
  url: text('url').notNull(),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
}, (t) => [unique().on(t.slot, t.variant)])

export const micRsvps = pgTable('mic_rsvps', {
  id: uuid('id').primaryKey().defaultRandom(),
  guestId: uuid('guest_id').notNull().references(() => guests.id).unique(),
  attending22: boolean('attending_22'),
  attending23: boolean('attending_23'),
  address: text('address'),
  note: text('note'),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
