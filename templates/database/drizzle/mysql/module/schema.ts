import { datetime, mysqlTable, varchar } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: varchar('id', { length: 36 }).primaryKey(),
  discordId: varchar('discord_id', { length: 20 }).notNull().unique(),
  username: varchar('username', { length: 100 }).notNull(),
  createdAt: datetime('created_at')
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: datetime('updated_at')
    .notNull()
    .$defaultFn(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
