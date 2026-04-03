import type { FallbackConfig } from '../fallback/interfaces';
import type { RateLimitStrategy } from '../types/rate-limit-strategy.type';

/**
 * Configuration for {@link SignalClient}.
 */
export interface SignalClientConfig {
  /**
   * One or more Discord webhook URLs pointing to the private signal channel.
   * The client rotates through them in round-robin order, automatically
   * skipping any that are currently rate-limited.
   */
  webhookUrls: Array<string>;

  /**
   * Shared HMAC-SHA256 secret used to sign outgoing envelopes.
   * Must match the `hmacSecret` configured in `@spraxium/signal` on the bot side.
   */
  hmacSecret: string;

  /**
   * How to behave when all webhooks are rate-limited simultaneously.
   *
   * - `'skip'` *(default)* , throws `AllWebhooksRateLimitedError` immediately.
   * - `'wait'` , waits for the soonest webhook to cool down, then retries once.
   *
   * @default 'skip'
   */
  rateLimitStrategy?: RateLimitStrategy;

  /**
   * Enables the fallback system for reliable signal delivery.
   * Failed signals are persisted and retried with exponential backoff.
   */
  fallback?: FallbackConfig;
}
