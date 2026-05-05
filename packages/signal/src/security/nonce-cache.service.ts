import { Injectable } from '@spraxium/common';
import { NONCE_TTL_MS } from '../constants';
import type { SignalConfig } from '../interfaces';
import { FileNonceStore } from './file-nonce-store';
import { MemoryNonceStore } from './memory-nonce-store';
import type { NonceStore } from './nonce-store.interface';

const DEFAULT_NONCE_FILE = '.spraxium/signal-nonces.json';

/**
 * Nonce deduplication cache, pluggable via {@link NonceStore}.
 *
 * Default backend is in-memory (fast, but loses state on restart). Enable
 * `persistNonces` in `SignalConfig` for a file-backed store that survives
 * restarts and closes the replay-after-crash attack window.
 *
 * Custom stores (Redis, SQL, etc.) can be wired with {@link NonceCache.setStore}
 * before `SignalRegistry.onBoot()` runs.
 */
@Injectable()
export class NonceCache {
  private store: NonceStore = new MemoryNonceStore(NONCE_TTL_MS);

  /**
   * Selects the backing store from the signal configuration. Called by
   * `SignalRegistry.onBoot()` before any messages are processed.
   */
  configure(config: Pick<SignalConfig, 'persistNonces'>): void {
    const opt = config.persistNonces;
    if (!opt) return;

    if (opt === true) {
      this.store = new FileNonceStore(DEFAULT_NONCE_FILE, NONCE_TTL_MS);
      return;
    }

    if (opt.store) {
      this.store = opt.store;
      return;
    }

    this.store = new FileNonceStore(opt.path ?? DEFAULT_NONCE_FILE, NONCE_TTL_MS);
  }

  /**
   * Replace the backing store. Intended for advanced wiring (e.g. a shared
   * Redis-backed implementation) and for tests.
   */
  setStore(store: NonceStore): void {
    this.store = store;
  }

  has(nonce: string): Promise<boolean> {
    return this.store.has(nonce);
  }

  add(nonce: string): Promise<void> {
    return this.store.add(nonce);
  }

  addIfAbsent(nonce: string): Promise<boolean> {
    return this.store.addIfAbsent(nonce);
  }

  async destroy(): Promise<void> {
    await this.store.destroy?.();
  }
}
