import type { I18nStore } from '../interfaces/i18n-store.interface';
import { MemoryStore } from './memory.store';

/**
 * Global registry for the i18n locale-preference store.
 *
 * Decouples store registration from the plugin config object so that
 * the store can be set in any bootstrap order — before or after `defineI18n`
 * — without modifying the framework config shape.
 *
 * ## Basic usage
 * ```ts
 * import { I18nStoreRegistry } from '@spraxium/i18n';
 * import { MyDatabaseStore } from './stores/database.store';
 *
 * I18nStoreRegistry.set(new MyDatabaseStore());
 * ```
 *
 * ## Lazy factories
 * If your store depends on services that are not available at module load
 * time, call `set()` inside `SpraxiumOnBoot.onBoot()` on any module that
 * boots before `I18nLifecycle`.
 *
 * ## Fallback
 * When no store is registered, the i18n lifecycle uses `MemoryStore`
 * automatically. Preferences are not persisted across restarts, but the
 * system works without any extra setup.
 */
export class I18nStoreRegistry {
  private static instance: I18nStore | null = null;

  /** Register a custom store implementation. Replaces any previously registered store. */
  static set(store: I18nStore): void {
    I18nStoreRegistry.instance = store;
  }

  /**
   * Retrieve the active store.
   * Returns the registered store, or a fresh `MemoryStore` when none has been set.
   */
  static get(): I18nStore {
    return I18nStoreRegistry.instance ?? new MemoryStore();
  }

  /** Returns `true` if a custom store has been explicitly registered. */
  static has(): boolean {
    return I18nStoreRegistry.instance !== null;
  }

  /** Clear the registered store. Intended for use in tests to reset state between runs. */
  static reset(): void {
    I18nStoreRegistry.instance = null;
  }
}
