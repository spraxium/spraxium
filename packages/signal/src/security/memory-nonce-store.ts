import type { NonceStore } from './nonce-store.interface';

/**
 * Default in-memory {@link NonceStore}. Fast, zero dependencies, but loses
 * state on process restart - only safe when the bot cannot be restarted
 * within the TTL window, or when replays are otherwise tolerated.
 */
export class MemoryNonceStore implements NonceStore {
  private readonly seen = new Map<string, number>();

  constructor(private readonly ttlMs: number) {}

  async has(nonce: string): Promise<boolean> {
    this.evict();
    return this.seen.has(nonce);
  }

  async add(nonce: string): Promise<void> {
    // First-seen wins: do not refresh an existing TTL.
    if (!this.seen.has(nonce)) this.seen.set(nonce, Date.now());
  }

  async addIfAbsent(nonce: string): Promise<boolean> {
    this.evict();
    if (this.seen.has(nonce)) return false;
    this.seen.set(nonce, Date.now());
    return true;
  }

  private evict(): void {
    const cutoff = Date.now() - this.ttlMs;
    for (const [nonce, timestamp] of this.seen) {
      if (timestamp < cutoff) this.seen.delete(nonce);
    }
  }
}
