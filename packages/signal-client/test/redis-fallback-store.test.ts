import { describe, expect, it, vi } from 'vitest';
import { RedisFallbackStore } from '../src/fallback/redis.store';

/**
 * Minimal in-memory stand-in for a subset of node-redis's v4 client. Implements
 * only what RedisFallbackStore touches, plus an assertion that `keys()` is never
 * called (regression guard for Phase 1.4).
 */
function createFakeRedis() {
  const store = new Map<string, string>();
  const sets = new Map<string, Set<string>>();

  return {
    store,
    keys: vi.fn(async (_pattern: string): Promise<string[]> => {
      throw new Error('keys() must not be called - use scan() instead');
    }),
    async get(key: string): Promise<string | null> {
      return store.get(key) ?? null;
    },
    async set(key: string, value: string): Promise<unknown> {
      store.set(key, value);
      return 'OK';
    },
    async del(key: string | string[]): Promise<unknown> {
      const keys = Array.isArray(key) ? key : [key];
      for (const k of keys) store.delete(k);
      return keys.length;
    },
    async scan(
      cursor: number | string,
      options?: { MATCH?: string; COUNT?: number },
    ): Promise<{ cursor: number | string; keys: string[] }> {
      // Single-pass fake scan: return all matching keys on first call, cursor=0.
      const pattern = options?.MATCH ?? '*';
      const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
      const allKeys = [...store.keys()].filter((k) => regex.test(k));
      // `cursor` starts at 0 and we always terminate on next call.
      if (String(cursor) !== '0') return { cursor: 0, keys: [] };
      return { cursor: 0, keys: allKeys };
    },
    async sAdd(key: string, member: string): Promise<unknown> {
      const set = sets.get(key) ?? new Set<string>();
      set.add(member);
      sets.set(key, set);
      return 1;
    },
    async sIsMember(key: string, member: string): Promise<number | boolean> {
      return sets.get(key)?.has(member) ?? false;
    },
    async sCard(key: string): Promise<number> {
      return sets.get(key)?.size ?? 0;
    },
  };
}

describe('RedisFallbackStore (SCAN-based enumeration)', () => {
  it('claimBatch does not call KEYS', async () => {
    const redis = createFakeRedis();
    const store = new RedisFallbackStore(redis);

    await store.enqueue({
      id: 'n1',
      envelope: {
        v: 1,
        event: 'e',
        guildId: 'g',
        nonce: 'n1',
        sentAt: 0,
        signature: 's',
        payload: {},
      },
      event: 'e',
      guildId: 'g',
      attempts: 0,
      nextAttemptAt: 0,
      createdAt: 0,
    });

    const batch = await store.claimBatch(10, Date.now());
    expect(batch).toHaveLength(1);
    expect(batch[0].id).toBe('n1');
    expect(redis.keys).not.toHaveBeenCalled();
  });

  it('pendingCount and deadLetterCount use SCAN, not KEYS', async () => {
    const redis = createFakeRedis();
    const store = new RedisFallbackStore(redis);

    await store.enqueue({
      id: 'a',
      envelope: {
        v: 1,
        event: 'e',
        guildId: 'g',
        nonce: 'a',
        sentAt: 0,
        signature: 's',
        payload: {},
      },
      event: 'e',
      guildId: 'g',
      attempts: 0,
      nextAttemptAt: 0,
      createdAt: 0,
    });

    expect(await store.pendingCount()).toBe(1);
    expect(await store.deadLetterCount()).toBe(0);
    expect(redis.keys).not.toHaveBeenCalled();
  });
});
