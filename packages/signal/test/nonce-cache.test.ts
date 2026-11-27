import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NonceCache } from '../src/security/nonce-cache.service';
import type { NonceStore } from '../src/security/nonce-store.interface';
import { RedisNonceStoreFactory } from '../src/security/redis-nonce-store.factory';

describe('NonceCache (in-memory default)', () => {
  let cache: NonceCache;

  beforeEach(() => {
    cache = new NonceCache(new RedisNonceStoreFactory());
  });

  it('has() returns false for unknown nonces', async () => {
    expect(await cache.has('never-seen')).toBe(false);
  });

  it('add() then has() reflects the write', async () => {
    await cache.add('nonce-a');
    expect(await cache.has('nonce-a')).toBe(true);
  });

  it('double-add is a no-op (first-seen wins)', async () => {
    await cache.add('nonce-b');
    await cache.add('nonce-b');
    expect(await cache.has('nonce-b')).toBe(true);
  });

  it('keeps a reservation through the timestamp window without extending it on duplicate writes', async () => {
    const start = new Date('2026-01-01T00:00:00Z').getTime();
    vi.useFakeTimers({ toFake: ['Date'] });
    try {
      vi.setSystemTime(start);
      await expect(cache.addIfAbsent('first')).resolves.toBe(true);
      vi.setSystemTime(start + 10 * 60_000);
      await expect(cache.addIfAbsent('first')).resolves.toBe(false);
      vi.setSystemTime(start + 11 * 60_000);
      await expect(cache.has('first')).resolves.toBe(false);
      await cache.add('first');
      await expect(cache.has('first')).resolves.toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('NonceCache (file-backed persistence)', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'spraxium-nonce-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('persists across instances (simulating process restart)', async () => {
    const path = join(dir, 'nonces.json');

    const first = new NonceCache(new RedisNonceStoreFactory());
    await first.configure({ persistNonces: { path } });
    await first.add('nonce-persist');
    await first.destroy();

    const second = new NonceCache(new RedisNonceStoreFactory());
    await second.configure({ persistNonces: { path } });
    expect(await second.has('nonce-persist')).toBe(true);
    await second.destroy();
  });

  it('accepts a custom store via persistNonces.store', async () => {
    const customStore = {
      has: vi.fn<NonceStore['has']>().mockResolvedValueOnce(true).mockResolvedValueOnce(false),
      add: vi.fn<NonceStore['add']>().mockResolvedValue(undefined),
      addIfAbsent: vi.fn<NonceStore['addIfAbsent']>().mockResolvedValue(false),
      destroy: vi.fn<NonNullable<NonceStore['destroy']>>().mockResolvedValue(undefined),
    };

    const cache = new NonceCache(new RedisNonceStoreFactory());
    await cache.configure({ persistNonces: { path: join(dir, 'unused.json'), store: customStore } });

    expect(await cache.has('injected')).toBe(true);
    expect(await cache.has('other')).toBe(false);
    await cache.add('new-one');

    await expect(cache.addIfAbsent('duplicate')).resolves.toBe(false);
    await cache.destroy();
    expect(customStore.has.mock.calls).toEqual([['injected'], ['other']]);
    expect(customStore.add).toHaveBeenCalledExactlyOnceWith('new-one');
    expect(customStore.addIfAbsent).toHaveBeenCalledExactlyOnceWith('duplicate');
    expect(customStore.destroy).toHaveBeenCalledTimes(1);
  });
});
