import { Injectable } from '@spraxium/common';
import { NONCE_TTL_MS } from '../constants';

/**
 * In-memory nonce deduplication cache.
 * Prevents replay attacks within the TTL window.
 */
@Injectable()
export class NonceCache {
  private readonly seen = new Map<string, number>();

  has(nonce: string): boolean {
    this.evict();
    return this.seen.has(nonce);
  }

  add(nonce: string): void {
    this.seen.set(nonce, Date.now());
  }

  private evict(): void {
    const cutoff = Date.now() - NONCE_TTL_MS;
    for (const [nonce, timestamp] of this.seen) {
      if (timestamp < cutoff) this.seen.delete(nonce);
    }
  }
}
