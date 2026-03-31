import type { WebhookStatus } from '../interfaces/webhook-status.interface';
import { SignalClientError } from './signal-client.error';

/**
 * Thrown when all webhooks in the pool are currently rate-limited and the
 * configured `rateLimitStrategy` is `'skip'`.
 *
 * Inspect `poolStatus` to see the cooldown expiry for each webhook and decide
 * when to retry.
 */
export class AllWebhooksRateLimitedError extends SignalClientError {
  constructor(public readonly poolStatus: ReadonlyArray<WebhookStatus>) {
    const msUntilFirst = Math.min(
      ...poolStatus.map((s) => (s.rateLimitedUntil > 0 ? s.rateLimitedUntil - Date.now() : 0)),
    );
    super(
      `All ${poolStatus.length} webhook(s) are rate-limited. Retry in ~${Math.ceil(msUntilFirst / 1_000)}s.`,
      429,
      '',
    );
    this.name = 'AllWebhooksRateLimitedError';
  }
}
