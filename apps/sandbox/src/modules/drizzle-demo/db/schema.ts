import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const sandboxDbChecks = pgTable('sandbox_db_checks', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  guildId: text('guild_id'),
  note: text('note').notNull(),
  latencyMs: integer('latency_ms').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type SandboxDbCheck = typeof sandboxDbChecks.$inferSelect;
