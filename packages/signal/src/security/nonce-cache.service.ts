import { Inject, Injectable } from '@spraxium/common';
import { NONCE_TTL_MS } from '../constants/defaults.constant';
import type { SignalConfig } from '../interfaces/signal-config.interface';
import { FileNonceStore } from './file-nonce-store';
import { MemoryNonceStore } from './memory-nonce-store';
import type { NonceStore } from './nonce-store.interface';
import { RedisNonceStoreFactory } from './redis-nonce-store.factory';

const DEFAULT_NONCE_FILE = '.spraxium/signal-nonces.json';

@Injectable()
export class NonceCache {
  private store: NonceStore = new MemoryNonceStore(NONCE_TTL_MS);

  constructor(@Inject(RedisNonceStoreFactory) private readonly redisStoreFactory: RedisNonceStoreFactory) {}

  async configure(config: Pick<SignalConfig, 'persistNonces'>): Promise<void> {
    const options = config.persistNonces;
    if (!options) return;
    if (options === true) {
      this.store = new FileNonceStore(DEFAULT_NONCE_FILE, NONCE_TTL_MS);
      return;
    }
    if (typeof options !== 'object') throw new Error('Invalid Signal persistNonces configuration.');

    if (options.type !== undefined) {
      if (options.type !== 'redis') throw new Error('Invalid Signal persistNonces backend.');
      if (
        ('path' in options && options.path !== undefined) ||
        ('store' in options && options.store !== undefined)
      ) {
        throw new Error('Signal Redis nonce options cannot be combined with path or store.');
      }
      this.store = await this.redisStoreFactory.create(options);
      return;
    }

    this.store = options.store ?? new FileNonceStore(options.path ?? DEFAULT_NONCE_FILE, NONCE_TTL_MS);
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
