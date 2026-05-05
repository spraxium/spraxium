import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FileFallbackStore } from '../src/fallback/file.store';
import type { FallbackEntry } from '../src/fallback/interfaces';

function entry(id: string, nextAttemptAt = 0): FallbackEntry {
  return {
    id,
    envelope: {
      v: 1,
      event: 'e',
      guildId: 'g',
      nonce: id,
      sentAt: 0,
      signature: 's',
      payload: {},
    },
    event: 'e',
    guildId: 'g',
    attempts: 0,
    nextAttemptAt,
    createdAt: 0,
  };
}

describe('FileFallbackStore (lock-protected)', () => {
  let dir: string;
  let filePath: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'spraxium-fb-'));
    filePath = join(dir, 'fallback.json');
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('concurrent enqueues do not lose entries', async () => {
    const store = new FileFallbackStore(filePath);

    const ids = Array.from({ length: 25 }, (_, i) => `entry-${i}`);
    await Promise.all(ids.map((id) => store.enqueue(entry(id))));

    const claimed = await store.claimBatch(100, Date.now());
    const claimedIds = new Set(claimed.map((c) => c.id));
    for (const id of ids) expect(claimedIds.has(id)).toBe(true);
  });

  it('releases the lock file on success', async () => {
    const store = new FileFallbackStore(filePath);
    await store.enqueue(entry('n1'));

    expect(existsSync(`${filePath}.lock`)).toBe(false);
  });

  it('steals a stale lock from a dead pid', async () => {
    // Plant a lock from a pid that cannot exist (PID 0 is reserved and the
    // kernel reports ESRCH for `process.kill(0, 0)` on all supported OSes).
    // We use MAX_SAFE_INTEGER as a pid guaranteed not to match a real process.
    await writeFile(`${filePath}.lock`, String(Number.MAX_SAFE_INTEGER), 'utf-8');

    const store = new FileFallbackStore(filePath);
    await store.enqueue(entry('after-steal'));

    const batch = await store.claimBatch(10, Date.now());
    expect(batch).toHaveLength(1);
    expect(batch[0].id).toBe('after-steal');
  });
});
