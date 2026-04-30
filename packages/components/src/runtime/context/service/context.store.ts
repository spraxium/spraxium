import { MemoryContextAdapter } from '../adapters';
import type { ContextStorageAdapter } from '../interfaces/context-storage.interface';
import type { SpraxiumContext } from '../interfaces/spraxium-context.interface';

const CLEANUP_INTERVAL_MS = 60_000;

/**
 * Central context store for the flow-context system.
 *
 * Maintains a hot in-process Map for zero-latency reads while delegating
 * persistence to the configured `ContextStorageAdapter`. The active adapter
 * can be swapped at boot time via `ContextStore.initialize(adapter)`.
 *
 * Lifecycle:
 * 1. `initialize(adapter)` — called by `ComponentLifecycle.onBoot()`
 *    Hydrates the hot cache from the adapter and starts the cleanup timer.
 * 2. `get` / `set` / `delete` — write-through: hot cache updated first,
 *    adapter persists asynchronously.
 * 3. `destroy()` — stops the cleanup timer (useful in tests).
 */
export class ContextStore {
  private static adapter: ContextStorageAdapter = new MemoryContextAdapter();
  private static hot = new Map<string, SpraxiumContext<unknown>>();
  private static timer: ReturnType<typeof setInterval> | undefined;

  /** Default TTL in seconds used by `ContextService.create()` when no `ttl` option is provided. */
  static defaultTtl = 300;

  /**
   * Replace the active storage adapter and hydrate the in-process hot cache.
   * Safe to call multiple times (e.g. during tests).
   */
  static async initialize(adapter: ContextStorageAdapter): Promise<void> {
    ContextStore.adapter = adapter;
    ContextStore.hot.clear();

    const now = Date.now();
    const stored = await adapter.entries();
    for (const ctx of stored) {
      if (ctx.expiresAt === 0 || ctx.expiresAt > now) ContextStore.hot.set(ctx.id, ctx);
    }

    ContextStore.startCleanup();
  }

  private static startCleanup(): void {
    if (ContextStore.timer) clearInterval(ContextStore.timer);
    const timer = setInterval(() => {
      void ContextStore.runCleanup();
    }, CLEANUP_INTERVAL_MS);
    if (typeof timer === 'object' && 'unref' in timer) {
      (timer as NodeJS.Timeout).unref();
    }
    ContextStore.timer = timer;
  }

  private static async runCleanup(): Promise<void> {
    const now = Date.now();
    for (const [id, ctx] of ContextStore.hot) {
      if (ctx.expiresAt !== 0 && ctx.expiresAt <= now) {
        ContextStore.hot.delete(id);
        await ContextStore.adapter.delete(id);
      }
    }
  }

  static async get<T = unknown>(id: string): Promise<SpraxiumContext<T> | undefined> {
    const cached = ContextStore.hot.get(id);
    if (cached) {
      if (cached.expiresAt !== 0 && cached.expiresAt <= Date.now()) {
        ContextStore.hot.delete(id);
        await ContextStore.adapter.delete(id);
        return undefined;
      }
      return cached as SpraxiumContext<T>;
    }

    // Fallback: adapter may have entries that weren't in the hot cache at startup.
    const ctx = await ContextStore.adapter.get(id);
    if (ctx) ContextStore.hot.set(ctx.id, ctx);
    return ctx as SpraxiumContext<T> | undefined;
  }

  static async set(ctx: SpraxiumContext<unknown>): Promise<void> {
    ContextStore.hot.set(ctx.id, ctx);
    await ContextStore.adapter.set(ctx);
  }

  static async delete(id: string): Promise<void> {
    ContextStore.hot.delete(id);
    await ContextStore.adapter.delete(id);
  }

  /** Stop the periodic cleanup timer. Primarily useful in test environments. */
  static destroy(): void {
    if (ContextStore.timer) {
      clearInterval(ContextStore.timer);
      ContextStore.timer = undefined;
    }
  }
}
