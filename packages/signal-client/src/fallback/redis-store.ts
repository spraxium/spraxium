import type { FallbackEntry, FallbackStore } from './interfaces';

type RedisClient = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<unknown>;
  del(key: string | string[]): Promise<unknown>;
  keys(pattern: string): Promise<string[]>;
  sAdd(key: string, member: string): Promise<unknown>;
  sIsMember(key: string, member: string): Promise<number | boolean>;
  sCard(key: string): Promise<number>;
};

const PREFIX = 'spraxium:signal:fallback';
const PENDING = `${PREFIX}:pending`;
const DL = `${PREFIX}:deadletter`;
const PROCESSED = `${PREFIX}:processed`;

export class RedisFallbackStore implements FallbackStore {
  constructor(private readonly redis: RedisClient) {}

  async enqueue(entry: FallbackEntry): Promise<void> {
    await this.redis.set(`${PENDING}:${entry.id}`, JSON.stringify(entry));
  }

  async claimBatch(limit: number, now: number): Promise<FallbackEntry[]> {
    const keys = await this.redis.keys(`${PENDING}:*`);
    const results: FallbackEntry[] = [];

    for (const key of keys) {
      if (results.length >= limit) break;
      const raw = await this.redis.get(key);
      if (!raw) continue;
      const entry = JSON.parse(raw) as FallbackEntry;
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
    const entry = JSON.parse(raw) as FallbackEntry;
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
    const keys = await this.redis.keys(`${PENDING}:*`);
    return keys.length;
  }

  async deadLetterCount(): Promise<number> {
    const keys = await this.redis.keys(`${DL}:*`);
    return keys.length;
  }
}
