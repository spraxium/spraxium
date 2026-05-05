import type { FallbackEntry, FallbackStore } from './interfaces';

/**
 * Minimal shape of the Redis client consumed by this store. Compatible with
 * node-redis v4's API. The `scan` signature matches node-redis's options-based
 * call; ioredis users can wrap their client to match this shape.
 */
type RedisClient = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<unknown>;
  del(key: string | string[]): Promise<unknown>;
  scan(
    cursor: number | string,
    options?: { MATCH?: string; COUNT?: number },
  ): Promise<{ cursor: number | string; keys: string[] }>;
  sAdd(key: string, member: string): Promise<unknown>;
  sIsMember(key: string, member: string): Promise<number | boolean>;
  sCard(key: string): Promise<number>;
};

const PREFIX = 'spraxium:signal:fallback';
const PENDING = `${PREFIX}:pending`;
const DL = `${PREFIX}:deadletter`;
const PROCESSED = `${PREFIX}:processed`;

// Batch size for each SCAN iteration. Small enough to stay responsive, large
// enough that realistic queues (< 10k pending) finish in 1-2 round trips.
const SCAN_COUNT = 200;

export class RedisFallbackStore implements FallbackStore {
  constructor(private readonly redis: RedisClient) {}

  async enqueue(entry: FallbackEntry): Promise<void> {
    await this.redis.set(`${PENDING}:${entry.id}`, JSON.stringify(entry));
  }

  async claimBatch(limit: number, now: number): Promise<FallbackEntry[]> {
    const results: FallbackEntry[] = [];

    for await (const key of this.scanKeys(`${PENDING}:*`)) {
      if (results.length >= limit) break;
      const raw = await this.redis.get(key);
      if (!raw) continue;
      const entry = RedisFallbackStore.parseEntry(raw);
      if (!entry) {
        await this.redis.del(key);
        continue;
      }
      if (entry.nextAttemptAt <= now) results.push(entry);
    }

    return results;
  }

  async markProcessed(id: string): Promise<void> {
    await this.redis.del(`${PENDING}:${id}`);
    await this.redis.sAdd(PROCESSED, id);
  }

  async reschedule(id: string, nextAttemptAt: number, reason: string, attempts: number): Promise<void> {
    const raw = await this.redis.get(`${PENDING}:${id}`);
    if (!raw) return;
    const entry = RedisFallbackStore.parseEntry(raw);
    if (!entry) {
      await this.redis.del(`${PENDING}:${id}`);
      return;
    }
    const updated: FallbackEntry = { ...entry, nextAttemptAt, attempts, lastError: reason };
    await this.redis.set(`${PENDING}:${id}`, JSON.stringify(updated));
  }

  async moveToDeadLetter(entry: FallbackEntry, reason: string): Promise<void> {
    await this.redis.del(`${PENDING}:${entry.id}`);
    await this.redis.set(`${DL}:${entry.id}`, JSON.stringify({ ...entry, lastError: reason }));
  }

  async has(id: string): Promise<boolean> {
    const inProcessed = await this.redis.sIsMember(PROCESSED, id);
    if (inProcessed) return true;
    const raw = await this.redis.get(`${PENDING}:${id}`);
    return raw !== null;
  }

  async pendingCount(): Promise<number> {
    return this.countKeys(`${PENDING}:*`);
  }

  async deadLetterCount(): Promise<number> {
    return this.countKeys(`${DL}:*`);
  }

  /**
   * Cursor-based iterator over keys matching `pattern`. Replaces the previously
   * used `KEYS` command, which is O(N) and blocks the Redis server for the
   * duration of the scan - unsafe in production for large keyspaces.
   */
  private async *scanKeys(pattern: string): AsyncGenerator<string, void, void> {
    let cursor: number | string = 0;
    do {
      const result = await this.redis.scan(cursor, { MATCH: pattern, COUNT: SCAN_COUNT });
      cursor = result.cursor;
      for (const key of result.keys) yield key;
    } while (String(cursor) !== '0');
  }

  private async countKeys(pattern: string): Promise<number> {
    let count = 0;
    for await (const _ of this.scanKeys(pattern)) count++;
    return count;
  }

  private static parseEntry(raw: string): FallbackEntry | null {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!RedisFallbackStore.isEntryShape(parsed)) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  private static isEntryShape(value: unknown): value is FallbackEntry {
    if (typeof value !== 'object' || value === null) return false;
    const v = value as Partial<FallbackEntry>;
    return (
      typeof v.id === 'string' &&
      typeof v.event === 'string' &&
      typeof v.guildId === 'string' &&
      typeof v.attempts === 'number' &&
      typeof v.nextAttemptAt === 'number' &&
      typeof v.createdAt === 'number' &&
      typeof v.envelope === 'object' &&
      v.envelope !== null
    );
  }
}
