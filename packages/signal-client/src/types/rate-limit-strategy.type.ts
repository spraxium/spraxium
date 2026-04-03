/**
 * Determines how `SignalClient` behaves when all webhooks in the pool are rate-limited.
 *
 * - `'skip'` , throws `AllWebhooksRateLimitedError` immediately.
 *   Best for fire-and-forget scenarios where the caller handles retries.
 *
 * - `'wait'` , waits for the soonest webhook to become available, then retries once.
 *   Best for critical signals where delivery must not be dropped.
 */
export type RateLimitStrategy = 'skip' | 'wait';
