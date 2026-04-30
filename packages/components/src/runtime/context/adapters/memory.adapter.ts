import type { ContextStorageAdapter } from '../interfaces/context-storage.interface';
import type { SpraxiumContext } from '../interfaces/spraxium-context.interface';

/**
 * In-process memory adapter — identical behaviour to the original ContextRegistry.
 * All data is lost when the process restarts. Use as a lightweight default when
 * persistence is not required.
 */
export class MemoryContextAdapter implements ContextStorageAdapter {
  private readonly store = new Map<string, SpraxiumContext<unknown>>();

  async get(id: string): Promise<SpraxiumContext<unknown> | undefined> {
    const ctx = this.store.get(id);
    if (!ctx) return undefined;
    if (ctx.expiresAt !== 0 && ctx.expiresAt <= Date.now()) {
      this.store.delete(id);
      return undefined;
    }
    return ctx;
  }

  async set(ctx: SpraxiumContext<unknown>): Promise<void> {
    this.store.set(ctx.id, ctx);
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }

  async entries(): Promise<ReadonlyArray<SpraxiumContext<unknown>>> {
    return Array.from(this.store.values());
  }
}
