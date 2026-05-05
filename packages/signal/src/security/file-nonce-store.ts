import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { NonceStore } from './nonce-store.interface';

interface Snapshot {
  readonly version: 1;
  readonly entries: Array<[string, number]>;
}

/**
 * File-backed {@link NonceStore}. The on-disk snapshot survives process
 * restarts so a replay attack cannot succeed by simply waiting for the bot
 * to crash-restart within the TTL window.
 *
 * Writes are serialized behind a promise chain and committed via a temp-file
 * + rename so a crash mid-flush cannot truncate the nonce log.
 *
 * Storage location: a single JSON file at `filePath` (default
 * `.spraxium/signal-nonces.json`).
 */
export class FileNonceStore implements NonceStore {
  private readonly seen = new Map<string, number>();
  private readonly ready: Promise<void>;
  private flushChain: Promise<void> = Promise.resolve();

  constructor(
    private readonly filePath: string,
    private readonly ttlMs: number,
  ) {
    this.ready = this.load();
  }

  async has(nonce: string): Promise<boolean> {
    await this.ready;
    this.evict();
    return this.seen.has(nonce);
  }

  async add(nonce: string): Promise<void> {
    await this.ready;
    if (this.seen.has(nonce)) return;
    this.seen.set(nonce, Date.now());
    await this.flush();
  }

  async addIfAbsent(nonce: string): Promise<boolean> {
    await this.ready;
    this.evict();
    if (this.seen.has(nonce)) return false;
    this.seen.set(nonce, Date.now());
    await this.flush();
    return true;
  }

  async destroy(): Promise<void> {
    // Wait for any pending flush to complete before returning.
    await this.flushChain;
  }

  private async load(): Promise<void> {
    try {
      const raw = await readFile(this.filePath, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<Snapshot>;
      if (parsed.version !== 1 || !Array.isArray(parsed.entries)) return;

      const cutoff = Date.now() - this.ttlMs;
      for (const [nonce, ts] of parsed.entries) {
        if (typeof nonce === 'string' && typeof ts === 'number' && ts >= cutoff) {
          this.seen.set(nonce, ts);
        }
      }
    } catch {
      // File does not exist yet or is malformed - start clean. The first
      // successful `add` will recreate it.
    }
  }

  private flush(): Promise<void> {
    // Serialize flushes so two overlapping `add` calls cannot interleave a
    // partial write with a full snapshot.
    this.flushChain = this.flushChain.then(() => this.doFlush());
    return this.flushChain;
  }

  private async doFlush(): Promise<void> {
    const snapshot: Snapshot = {
      version: 1,
      entries: Array.from(this.seen.entries()),
    };
    const tmpPath = `${this.filePath}.tmp`;
    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(tmpPath, JSON.stringify(snapshot), 'utf-8');
    await rename(tmpPath, this.filePath);
  }

  private evict(): void {
    const cutoff = Date.now() - this.ttlMs;
    let changed = false;
    for (const [nonce, timestamp] of this.seen) {
      if (timestamp < cutoff) {
        this.seen.delete(nonce);
        changed = true;
      }
    }
    if (changed) {
      // Fire-and-forget: eviction is an optimization, losing it until the
      // next add() is acceptable.
      void this.flush();
    }
  }
}
