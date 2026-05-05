/**
 * Pluggable backend for {@link NonceCache}. Implementations must guarantee
 * that `has` and `add` reflect the same logical state - persistence is
 * optional but strongly recommended for production deployments to prevent
 * replay attacks across restarts.
 *
 * All methods are async so remote stores (file, Redis, SQL) can participate
 * without blocking the event loop.
 */
export interface NonceStore {
  /**
   * Returns `true` if `nonce` was recorded and has not yet expired.
   * Must not throw - return `false` on any I/O failure so the caller
   * can still decide whether to reject or accept (conservative default
   * in the validator is to reject only on a positive hit).
   */
  has(nonce: string): Promise<boolean>;

  /**
   * Records `nonce` with a TTL. If the nonce is already present, the
   * existing TTL should be preserved (first-seen wins).
   */
  add(nonce: string): Promise<void>;

  /**
   * Atomically checks whether `nonce` is present and, if absent, records it.
   * Returns `true` when the nonce was newly added (not a replay), `false`
   * when it was already seen. The check-and-set must be indivisible to
   * prevent TOCTOU races under concurrent async load.
   */
  addIfAbsent(nonce: string): Promise<boolean>;

  /**
   * Optional teardown. Called by `SignalRegistry.onShutdown()` when the
   * bot is stopping gracefully.
   */
  destroy?(): Promise<void>;
}
