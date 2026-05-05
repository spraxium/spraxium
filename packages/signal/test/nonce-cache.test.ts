import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { NonceCache } from '../src/security/nonce-cache.service';

describe('NonceCache (in-memory default)', () => {
  let cache: NonceCache;

  beforeEach(() => {
    cache = new NonceCache();
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

    const first = new NonceCache();
    first.configure({ persistNonces: { path } });
    await first.add('nonce-persist');
    await first.destroy();

    // Fresh instance - simulates a bot restart.
    const second = new NonceCache();
    second.configure({ persistNonces: { path } });
    expect(await second.has('nonce-persist')).toBe(true);
    await second.destroy();
  });

  it('accepts a custom store via persistNonces.store', async () => {
    const customStore: {
      has: (n: string) => Promise<boolean>;
      add: (n: string) => Promise<void>;
      calls: string[];
    } = {
      calls: [],
      async has(n: string) {
        this.calls.push(`has:${n}`);
        return n === 'injected';
      },
      async add(n: string) {
        this.calls.push(`add:${n}`);
      },
    };

    const cache = new NonceCache();
    cache.configure({ persistNonces: { store: customStore } });

    expect(await cache.has('injected')).toBe(true);
    expect(await cache.has('other')).toBe(false);
    await cache.add('new-one');

    expect(customStore.calls).toEqual(['has:injected', 'has:other', 'add:new-one']);
  });
});
