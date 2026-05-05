import { ContextStore } from '../../../runtime/context';
import type { SpraxiumContext } from '../../../runtime/context';

interface CacheEntry {
  values: Record<string, string>;
  expiresAt: number;
}

/**
 * Key prefix used when persisting modal field caches to {@link ContextStore}.
 * The prefix keeps the modal-cache namespace disjoint from flow contexts and
 * payload envelopes, which share the same adapter.
 */
const STORE_PREFIX = 'modal-cache:';

/**
 * Per-user cache of modal field submissions.
 *
 * Hot path is a synchronous in-process Map so {@link ModalService.buildFor}
 * can stay sync. Writes are mirrored to {@link ContextStore} when
 * {@link ModalFieldCache.bindStore} has been called, giving the cache
 * persistence across restarts and - with a Redis adapter - cross-shard
 * availability at boot time.
 *
 * Consistency caveat: because `get()` only ever hits the local Map, entries
 * written on shard A become visible on shard B only after shard B re-hydrates
 * (i.e. at boot). In practice this is fine for validation prefill, which is
 * triggered by the same user on a single shard.
 */
export class ModalFieldCache {
  private static readonly store = new Map<string, CacheEntry>();
  private static persistEnabled = false;

  static key(customId: string, userId: string): string {
    return `${customId}:${userId}`;
  }

  /**
   * Enable write-through persistence to {@link ContextStore}. Called once by
   * `ComponentLifecycle.onBoot()` after the context adapter has been
   * initialized. Safe to call multiple times.
   */
  static bindStore(): void {
    ModalFieldCache.persistEnabled = true;
  }

  /**
   * Load every `modal-cache:*` entry from {@link ContextStore} into the hot
   * Map. Called once at boot so that validation prefills survive a restart.
   */
  static async hydrate(): Promise<void> {
    const now = Date.now();
    // ContextStore does not expose a prefix-scan API, so we pull from its
    // hot cache via getByPrefix-equivalent: probe by reading the known prefix
    // via the adapter (exposed indirectly through ContextStore.get). Since
    // ContextStore.initialize() has already hydrated all entries into its
    // hot cache, we iterate using a dedicated seed method on the store.
    for (const ctx of await ContextStore.entriesWithPrefix(STORE_PREFIX)) {
      if (ctx.expiresAt !== 0 && ctx.expiresAt <= now) continue;
      const key = ctx.id.slice(STORE_PREFIX.length);
      ModalFieldCache.store.set(key, {
        values: ctx.data as Record<string, string>,
        expiresAt: ctx.expiresAt,
      });
    }
  }

  static set(key: string, values: Record<string, string>, ttlSeconds: number): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    ModalFieldCache.store.set(key, { values, expiresAt });

    if (ModalFieldCache.persistEnabled) {
      // Fire-and-forget: persistence is an enhancement; the hot read path
      // above is the source of truth during runtime.
      void ContextStore.set({
        id: STORE_PREFIX + key,
        data: values,
        createdAt: Date.now(),
        ttl: ttlSeconds,
        expiresAt,
      } as SpraxiumContext<unknown>);
    }
  }

  static get(key: string): Record<string, string> | null {
    const entry = ModalFieldCache.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      ModalFieldCache.store.delete(key);
      if (ModalFieldCache.persistEnabled) {
        void ContextStore.delete(STORE_PREFIX + key);
      }
      return null;
    }
    return entry.values;
  }

  static delete(key: string): void {
    ModalFieldCache.store.delete(key);
    if (ModalFieldCache.persistEnabled) {
      void ContextStore.delete(STORE_PREFIX + key);
    }
  }

  static get size(): number {
    const now = Date.now();
    for (const [k, v] of ModalFieldCache.store) {
      if (now > v.expiresAt) ModalFieldCache.store.delete(k);
    }
    return ModalFieldCache.store.size;
  }

  /** Reset both hot cache and persistence flag. Intended for tests. */
  static reset(): void {
    ModalFieldCache.store.clear();
    ModalFieldCache.persistEnabled = false;
  }
}
