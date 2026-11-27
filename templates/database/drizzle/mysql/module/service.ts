import { Injectable, type SpraxiumOnBoot, type SpraxiumOnShutdown } from '@spraxium/common';
import { Logger } from '@spraxium/logger';
import { AppEnv } from '../../app.env';
import { type MySql2Database, drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

@Injectable()
export class {{PASCAL_NAME}}Service implements SpraxiumOnBoot, SpraxiumOnShutdown {
  private readonly logger = new Logger({{PASCAL_NAME}}Service.name);
  private pool: mysql.Pool | null = null;
  private db: MySql2Database<typeof schema> | null = null;

  constructor(private readonly env: AppEnv) {}

  /** Opens the database connection before the application handles interactions. */
  async onBoot(): Promise<void> {
    this.pool = mysql.createPool(this.env.DATABASE_URL);
    this.db = drizzle(this.pool, { schema, mode: 'default' });
    await this.pool.query('SELECT 1');
    this.logger.info('Drizzle connected to MySQL');
  }

  /** Releases the database connection when the application shuts down. */
  async onShutdown(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.db = null;
    }
  }

  /** Returns the initialized query client, or throws when the service has not booted. */
  getDb(): MySql2Database<typeof schema> {
    if (!this.db) throw new Error('Database is not initialized');
    return this.db;
  }
}
