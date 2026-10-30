import { describe, expect, it } from 'vitest';
import { RedisScheduleDriver } from '../../src/drivers/redis.driver';

/**
 * Minimal in-memory stand-in for the ioredis commands the driver uses:
 * `SET key value EX ttl NX` and the compare-and-delete release script.
 */
function createFakeRedis() {
  const store = new Map<string, string>();
  return {
    store,
    async set(key: string, value: string, _ex: string, _ttl: number, _nx: string): Promise<'OK' | null> {
      if (store.has(key)) return null;
      store.set(key, value);
      return 'OK';
    },
    async eval(_script: string, _numKeys: number, key: string, token: string): Promise<number> {
      if (store.get(key) !== token) return 0;
      store.delete(key);
      return 1;
    },
    disconnect(): void {},
  };
}

function createDriver() {
  const redis = createFakeRedis();
  const driver = new RedisScheduleDriver({ keyPrefix: 'test:' });
  (driver as unknown as { client: unknown }).client = redis;
  return { driver, redis };
}

describe('RedisScheduleDriver lease ownership', () => {
  it('returns a distinct token for every acquisition', async () => {
    const { driver, redis } = createDriver();

    const first = await driver.acquireLock('job', 1_000);
    expect(typeof first).toBe('string');
    await driver.releaseLock('job', first as string);

    const second = await driver.acquireLock('job', 1_000);
    expect(typeof second).toBe('string');
    expect(second).not.toBe(first);
    expect(redis.store.get('test:lock:job')).toBe(second);
  });

  it('does not let a stale invocation release a newer lease from the same process', async () => {
    const { driver, redis } = createDriver();

    const stale = await driver.acquireLock('job', 1_000);
    // The first invocation outlives its TTL: Redis expires the key.
    redis.store.delete('test:lock:job');

    const fresh = await driver.acquireLock('job', 1_000);
    expect(fresh).toBeTruthy();

    // The stale invocation finally completes and releases with its own token.
    await driver.releaseLock('job', stale as string);
    expect(redis.store.get('test:lock:job')).toBe(fresh);

    await driver.releaseLock('job', fresh as string);
    expect(redis.store.has('test:lock:job')).toBe(false);
  });

  it('returns false while another owner holds the lease', async () => {
    const { driver } = createDriver();
    expect(await driver.acquireLock('job', 1_000)).toBeTruthy();
    expect(await driver.acquireLock('job', 1_000)).toBe(false);
  });

  it('does not delete anything when released without a token', async () => {
    const { driver, redis } = createDriver();
    await driver.acquireLock('job', 1_000);
    await driver.releaseLock('job');
    expect(redis.store.has('test:lock:job')).toBe(true);
  });
});
