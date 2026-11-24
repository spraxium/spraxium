import type { RedisNonceStoreOptions } from '../interfaces/redis-nonce-store-options.interface';
import type { NonceStore } from '../security/nonce-store.interface';

export type PersistNoncesOption =
  | boolean
  | {
      readonly type?: never;
      readonly path?: string;
      readonly store?: NonceStore;
    }
  | RedisNonceStoreOptions;
