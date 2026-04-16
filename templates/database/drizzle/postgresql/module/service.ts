import { Injectable, type SpraxiumOnBoot, type SpraxiumOnShutdown } from '@spraxium/common';
import { Logger } from '@spraxium/core';
import { AppEnv } from '../../app.env';
import { type NodePgDatabase, drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

@Injectable()
export class {{PASCAL_NAME}}Service implements SpraxiumOnBoot, SpraxiumOnShutdown {
  private readonly logger = new Logger({{PASCAL_NAME}}Service.name);
  private pool: Pool | null = null;
  private db: NodePgDatabase<typeof schema> | null = null;

  constructor(private readonly env: AppEnv) {}

  async onBoot(): Promise<void> {
    this.pool = new Pool({ connectionString: this.env.DATABASE_URL });
    this.db = drizzle(this.pool, { schema });
    await this.pool.query('SELECT 1');
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
    if (!this.db) throw new Error('Database is not initialized');
    return this.db;
  }
}
