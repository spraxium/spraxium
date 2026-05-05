import { Injectable, type SpraxiumOnBoot, type SpraxiumOnShutdown } from '@spraxium/common';
import { Logger } from '@spraxium/logger';
import { sql } from 'drizzle-orm';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../db/schema';

@Injectable()
export class DrizzleConnectionService implements SpraxiumOnBoot, SpraxiumOnShutdown {
  private readonly logger = new Logger(DrizzleConnectionService.name);
  private pool: Pool | null = null;
  private db: NodePgDatabase<typeof schema> | null = null;

  async onBoot(): Promise<void> {
    const databaseUrl = process.env['DATABASE_URL'];

    if (!databaseUrl) {
      throw new Error('DATABASE_URL is required for DrizzleConnectionService');
    }

    this.pool = new Pool({ connectionString: databaseUrl });
    this.db = drizzle(this.pool, { schema });

    await this.pool.query('select 1');
    await this.ensureSchema();

    this.logger.info('Drizzle connected to PostgreSQL');
  }

  async onShutdown(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.db = null;
    }
  }

  getDb(): NodePgDatabase<typeof schema> {
    if (!this.db) {
      throw new Error('Drizzle database is not initialized yet.');
    }

    return this.db;
  }

  private async ensureSchema(): Promise<void> {
    const db = this.getDb();

    await db.execute(sql`
      create table if not exists sandbox_db_checks (
        id serial primary key,
        user_id text not null,
        guild_id text,
        note text not null,
        latency_ms integer not null,
        created_at timestamptz not null default now()
      )
    `);
  }
}
