import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const userLocalePreferences = pgTable('user_locale_preferences', {
  userId:    text('user_id').primaryKey(),
  locale:    text('locale').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const guildLocalePreferences = pgTable('guild_locale_preferences', {
  guildId:   text('guild_id').primaryKey(),
  locale:    text('locale').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type UserLocalePreference  = typeof userLocalePreferences.$inferSelect;
export type GuildLocalePreference = typeof guildLocalePreferences.$inferSelect;
