import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import type { SqliteContextAdapterOptions } from '../interfaces/context-adapter-options.interface';
import type { ContextStorageAdapter } from '../interfaces/context-storage.interface';
import type { SpraxiumContext } from '../interfaces/spraxium-context.interface';

/**
 * SQLite-backed persistence adapter (requires `better-sqlite3` as a peer dependency).
 *
 * Contexts are stored as individual rows in a `contexts` table, so every
 * `set` and `delete` is a targeted row-level operation; no full-file rewrite
 * on every change, unlike the JSON file adapter.
 *
 * Properties:
 * - **Persistent**: survives process restarts.
 * - **No external process**: single `.db` file, embedded in the application.
 * - **Binary B-tree storage**: more compact and faster than JSON for large stores.
 * - **ACID**: each write is an atomic transaction.
 *
 * Install the optional peer dependency before enabling this adapter:
 * ```
 * pnpm add better-sqlite3
 * pnpm add -D @types/better-sqlite3
 * ```
 */
export class SqliteContextAdapter implements ContextStorageAdapter {
  // biome-ignore lint/suspicious/noExplicitAny: better-sqlite3 is an optional peer dep; typed as any to avoid hard dep
  private readonly db: any;

  constructor(options: SqliteContextAdapterOptions = {}) {
    const dbPath = options.path ?? '.spraxium/contexts.db';

    try {
      mkdirSync(dirname(dbPath), { recursive: true });
    } catch {
      // Ignore if directory already exists or creation fails for other reasons.
    }

    try {
      const _require = createRequire(import.meta.url);
      const Database = _require('better-sqlite3') as new (path: string) => unknown;
      this.db = new Database(dbPath);
    } catch {
      throw new Error(
        '[Spraxium] SqliteContextAdapter requires the "better-sqlite3" package. ' +
          'Run: pnpm add better-sqlite3',
      );
    }

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS contexts (
        id          TEXT    PRIMARY KEY,
        data        TEXT    NOT NULL,
        expires_at  INTEGER NOT NULL
      )
    `);
  }

  async get(id: string): Promise<SpraxiumContext<unknown> | undefined> {
    const row = this.db.prepare('SELECT data, expires_at FROM contexts WHERE id = ?').get(id) as
      | { data: string; expires_at: number }
      | undefined;

    if (!row) return undefined;

    if (row.expires_at !== 0 && row.expires_at <= Date.now()) {
      this.db.prepare('DELETE FROM contexts WHERE id = ?').run(id);
      return undefined;
    }

    return JSON.parse(row.data) as SpraxiumContext<unknown>;
  }

  async set(ctx: SpraxiumContext<unknown>): Promise<void> {
    this.db
      .prepare(
        `INSERT INTO contexts (id, data, expires_at)
         VALUES (?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET data = excluded.data, expires_at = excluded.expires_at`,
      )
      .run(ctx.id, JSON.stringify(ctx), ctx.expiresAt);
  }

  async delete(id: string): Promise<void> {
    this.db.prepare('DELETE FROM contexts WHERE id = ?').run(id);
  }

  async entries(): Promise<ReadonlyArray<SpraxiumContext<unknown>>> {
    const rows = this.db
      .prepare('SELECT data FROM contexts WHERE expires_at = 0 OR expires_at > ?')
      .all(Date.now()) as Array<{
      data: string;
    }>;

    return rows.map((r) => JSON.parse(r.data) as SpraxiumContext<unknown>);
  }
}
