import { Injectable, type SpraxiumOnBoot, type SpraxiumOnShutdown } from '@spraxium/common';
import { Logger } from '@spraxium/logger';
import { AppEnv } from '../../app.env';
import Database from 'better-sqlite3';
import { type BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

@Injectable()
export class {{PASCAL_NAME}}Service implements SpraxiumOnBoot, SpraxiumOnShutdown {
  private readonly logger = new Logger({{PASCAL_NAME}}Service.name);
  private db: BetterSQLite3Database<typeof schema> | null = null;

  constructor(private readonly env: AppEnv) {}

  async onBoot(): Promise<void> {
    const sqlite = new Database(this.env.DATABASE_PATH);
    this.db = drizzle(sqlite, { schema });
    this.logger.info(`Drizzle connected to SQLite at ${this.env.DATABASE_PATH}`);
  }

  async onShutdown(): Promise<void> {
    this.db = null;
  }

  getDb(): BetterSQLite3Database<typeof schema> {
    if (!this.db) throw new Error('Database is not initialized');
    return this.db;
  }
}
