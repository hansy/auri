import { pgTable, text, timestamp, boolean, integer, jsonb, uuid, pgEnum } from 'drizzle-orm/pg-core';

export const levelEnum = pgEnum('cefr_level', ['A2', 'B1', 'B2', 'C1']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  targetLanguage: text('target_language').notNull(),
  level: levelEnum('level').notNull(),
  streak: integer('streak').default(0).notNull(),
  domainIndex: integer('domain_index').default(0).notNull(),
  isConfirmed: boolean('is_confirmed').default(false).notNull(),
  lastCompletedDate: text('last_completed_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});


export const emailConfirmations = pgTable('email_confirmations', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const lessons = pgTable('lessons', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  contentJson: jsonb('content_json').notNull(),
  audioUrl: text('audio_url'), // Link to stored audio if we store it, or just base64 in json? Let's keep a field.
  sentAt: timestamp('sent_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
