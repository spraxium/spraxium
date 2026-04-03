import type { SpraxiumContext } from './spraxium-context.interface';

/**
 * Pluggable storage backend for the flow-context system.
 *
 * Implementations must be fully async to support both local (file, memory)
 * and remote (Redis) backends without blocking the event loop.
 */
export interface ContextStorageAdapter {
  /**
   * Retrieve a single context by its ID.
   * Returns `undefined` if the entry does not exist or has already expired.
   */
  get(id: string): Promise<SpraxiumContext<unknown> | undefined>;

  /**
   * Persist (insert or overwrite) a context entry.
   */
  set(ctx: SpraxiumContext<unknown>): Promise<void>;

  /**
   * Remove a context entry.
   * Resolves silently even if the entry does not exist.
   */
  delete(id: string): Promise<void>;

  /**
   * Iterate over all stored contexts.
   * Used during startup hydration and periodic cleanup.
   */
  entries(): Promise<ReadonlyArray<SpraxiumContext<unknown>>>;
}
