/**
 * Status snapshot of a single webhook in the pool.
 * Returned by `WebhookPool.status()` , use it for monitoring or custom routing.
 */
export interface WebhookStatus {
  /** Zero-based index in the pool. */
  readonly index: number;
  /** Redacted Discord webhook URL safe for logs and monitoring output. */
  readonly url: string;
  /** Whether this webhook is currently available (not rate-limited). */
  readonly available: boolean;
  /**
   * Unix timestamp (ms) until which this webhook is rate-limited.
   * `0` means available now.
   */
  readonly rateLimitedUntil: number;
}
