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
