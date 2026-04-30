import { createRequire } from 'node:module';
import type { RedisContextAdapterOptions } from '../interfaces/context-adapter-options.interface';
import type { ContextStorageAdapter } from '../interfaces/context-storage.interface';
import type { SpraxiumContext } from '../interfaces/spraxium-context.interface';

/**
 * Redis-backed persistence adapter (requires `ioredis` as a peer dependency).
 *
 * Each context entry is stored as a Redis string (JSON serialised) with an
 * absolute TTL derived from `ctx.expiresAt` so that Redis handles eviction
 * automatically — no separate cleanup timers are needed.
 *
 * Install the optional peer dependency before enabling this adapter:
 * ```
 * pnpm add ioredis
 * ```
 */
export class RedisContextAdapter implements ContextStorageAdapter {
  // biome-ignore lint/suspicious/noExplicitAny: ioredis is an optional peer dep; typed as any to avoid hard dep
  private readonly client: any;
  private readonly prefix: string;

  constructor(options: RedisContextAdapterOptions = {}) {
    this.prefix = options.keyPrefix ?? 'spraxium:ctx:';
    try {
      // Use createRequire so bundlers treat ioredis as an optional external module
      // rather than attempting to inline it.
      const _require = createRequire(import.meta.url);
      const Redis = _require('ioredis') as {
        new (opts: RedisContextAdapterOptions): unknown;
      };
      this.client = new Redis({
        host: options.host ?? '127.0.0.1',
        port: options.port ?? 6379,
        password: options.password,
        db: options.db ?? 0,
      });
    } catch {
      throw new Error('[Spraxium] RedisContextAdapter requires the "ioredis" package. Run: pnpm add ioredis');
    }
  }

  private key(id: string): string {
    return `${this.prefix}${id}`;
  }

  async get(id: string): Promise<SpraxiumContext<unknown> | undefined> {
    const raw: string | null = await (this.client.get(this.key(id)) as Promise<string | null>);
    if (!raw) return undefined;
    const ctx = JSON.parse(raw) as SpraxiumContext<unknown>;
    if (ctx.expiresAt !== 0 && ctx.expiresAt <= Date.now()) {
      await this.delete(id);
      return undefined;
    }
    return ctx;
  }

  async set(ctx: SpraxiumContext<unknown>): Promise<void> {
    if (ctx.expiresAt === 0) {
      await (this.client.set(this.key(ctx.id), JSON.stringify(ctx)) as Promise<unknown>);
      return;
    }
    const ttlMs = ctx.expiresAt - Date.now();
    if (ttlMs <= 0) return;
    await (this.client.set(this.key(ctx.id), JSON.stringify(ctx), 'PX', ttlMs) as Promise<unknown>);
  }

  async delete(id: string): Promise<void> {
    await (this.client.del(this.key(id)) as Promise<unknown>);
  }

  async entries(): Promise<ReadonlyArray<SpraxiumContext<unknown>>> {
    const keys: Array<string> = await (this.client.keys(`${this.prefix}*`) as Promise<Array<string>>);
    if (keys.length === 0) return [];
    const values: Array<string | null> = await (this.client.mget(...keys) as Promise<Array<string | null>>);
    const now = Date.now();
    const results: Array<SpraxiumContext<unknown>> = [];
    for (const raw of values) {
      if (!raw) continue;
      const ctx = JSON.parse(raw) as SpraxiumContext<unknown>;
      if (ctx.expiresAt === 0 || ctx.expiresAt > now) results.push(ctx);
    }
    return results;
  }
}
