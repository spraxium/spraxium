import type { I18nStore } from "@spraxium/i18n";
import { Logger } from "@spraxium/logger";
import { eq, sql } from "drizzle-orm";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./locale.schema";

export class DrizzleLocaleStore implements I18nStore {
  private readonly logger = new Logger(DrizzleLocaleStore.name);
  private readonly pool: Pool;
  private readonly db: NodePgDatabase<typeof schema>;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
    this.db = drizzle(this.pool, { schema });
  }

  async init(): Promise<void> {
    await this.verifyConnection();
    await this.ensureTables();
    this.logger.info("DrizzleLocaleStore ready");
  }

  async destroy(): Promise<void> {
    await this.pool.end();
  }

  async getUser(userId: string): Promise<string | undefined> {
    const [row] = await this.db
      .select({ locale: schema.userLocalePreferences.locale })
      .from(schema.userLocalePreferences)
      .where(eq(schema.userLocalePreferences.userId, userId))
      .limit(1);

    return row?.locale;
  }

  async setUser(userId: string, locale: string): Promise<void> {
    await this.db
      .insert(schema.userLocalePreferences)
      .values({ userId, locale })
      .onConflictDoUpdate({
        target: schema.userLocalePreferences.userId,
        set: {
          locale,
          updatedAt: sql`now()`,
        },
      });
  }

  async getGuild(guildId: string): Promise<string | undefined> {
    const [row] = await this.db
      .select({ locale: schema.guildLocalePreferences.locale })
      .from(schema.guildLocalePreferences)
      .where(eq(schema.guildLocalePreferences.guildId, guildId))
      .limit(1);

    return row?.locale;
  }

  async setGuild(guildId: string, locale: string): Promise<void> {
    await this.db
      .insert(schema.guildLocalePreferences)
      .values({ guildId, locale })
      .onConflictDoUpdate({
        target: schema.guildLocalePreferences.guildId,
        set: {
          locale,
          updatedAt: sql`now()`,
        },
      });
  }

  private async verifyConnection(): Promise<void> {
    await this.pool.query("SELECT 1");
    this.logger.info("Database connection verified");
  }

  private async ensureTables(): Promise<void> {
    await this.db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_locale_preferences (
        user_id    TEXT        PRIMARY KEY,
        locale     TEXT        NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await this.db.execute(sql`
      CREATE TABLE IF NOT EXISTS guild_locale_preferences (
        guild_id   TEXT        PRIMARY KEY,
        locale     TEXT        NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    this.logger.info("Locale tables verified");
  }
}
