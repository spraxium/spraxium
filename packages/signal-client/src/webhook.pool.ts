import type { WebhookStatus } from './interfaces/webhook-status.interface';

/**
 * Manages a pool of Discord webhook URLs with rate-limit awareness.
 *
 * Selection strategy: round-robin among webhooks that are **not** currently
 * rate-limited. When a 429 is received, call `markRateLimited()` so the pool
 * skips that entry until its cooldown expires.
 *
 * @example
 * // Via SignalClient (automatic):
 * const client = new SignalClient({ webhookUrls: [...], hmacSecret: '...' });
 * console.log(client.pool.status());
 *
 * // Standalone (manual routing):
 * const pool = new WebhookPool(['https://...', 'https://...']);
 * const entry = pool.next(); // { url, index } | null
 */
export class WebhookPool {
  private cursor = 0;
  private readonly cooldowns = new Map<number, number>();

  constructor(private readonly urls: ReadonlyArray<string>) {
    if (urls.length === 0) {
      throw new Error('WebhookPool requires at least one webhook URL.');
    }
  }

  get size(): number {
    return this.urls.length;
  }

  /**
   * Returns the next available (non-rate-limited) entry in round-robin order.
   * Returns `null` if all webhooks are currently rate-limited.
   */
  next(): { url: string; index: number } | null {
    const now = Date.now();
    for (let i = 0; i < this.urls.length; i++) {
      const idx = (this.cursor + i) % this.urls.length;
      if (!this.isRateLimited(idx, now)) {
        this.cursor = (idx + 1) % this.urls.length;
        return { url: this.urls[idx] as string, index: idx };
      }
    }
    return null;
  }

  /**
   * Returns the webhook at a specific index, bypassing rate-limit checks.
   * Useful for targeted sends where the caller manages routing manually.
   *
   * @throws {RangeError} if the index is out of bounds.
   */
  get(index: number): string {
    if (index < 0 || index >= this.urls.length) {
      throw new RangeError(`Webhook index ${index} out of bounds (pool size: ${this.urls.length}).`);
    }
    return this.urls[index] as string;
  }

  /**
   * Marks a webhook as rate-limited for the given duration.
   * Called automatically by `SignalClient` on HTTP 429 responses.
   */
  markRateLimited(index: number, retryAfterMs: number): void {
    this.cooldowns.set(index, Date.now() + retryAfterMs);
  }

  /**
   * Returns the milliseconds until the soonest webhook becomes available.
   * Returns `0` if at least one webhook is available right now.
   */
  msUntilAvailable(): number {
    const now = Date.now();
    let min = Number.POSITIVE_INFINITY;
    for (let i = 0; i < this.urls.length; i++) {
      const expiry = this.cooldowns.get(i) ?? 0;
      if (expiry <= now) return 0;
      min = Math.min(min, expiry - now);
    }
    return min === Number.POSITIVE_INFINITY ? 0 : min;
  }

  /**
   * Returns a read-only snapshot of the current status of all webhooks.
   * Useful for monitoring, dashboards, or building custom routing logic.
   */
  status(): ReadonlyArray<WebhookStatus> {
    const now = Date.now();
    return this.urls.map((url, index) => {
      const expiry = this.cooldowns.get(index) ?? 0;
      const rateLimitedUntil = expiry > now ? expiry : 0;
      return {
        index,
        url: WebhookPool.redactWebhookUrl(url),
        available: rateLimitedUntil === 0,
        rateLimitedUntil,
      };
    });
  }

  private static redactWebhookUrl(url: string): string {
    try {
      const parsed = new URL(url);
      const parts = parsed.pathname.split('/').filter(Boolean);
      const webhooksIndex = parts.findIndex((p) => p === 'webhooks');

      if (webhooksIndex !== -1 && parts.length > webhooksIndex + 1) {
        const webhookId = parts[webhooksIndex + 1];
        return `${parsed.origin}/api/webhooks/${webhookId}/[REDACTED]`;
      }

      return `${parsed.origin}${parsed.pathname}`;
    } catch {
      const marker = '/api/webhooks/';
      const markerIndex = url.indexOf(marker);
      if (markerIndex !== -1) {
        const pathStart = markerIndex + marker.length;
        const id = url.slice(pathStart).split('/')[0];
        if (id) return `${url.slice(0, pathStart)}${id}/[REDACTED]`;
      }
      return '[REDACTED]';
    }
  }

  private isRateLimited(index: number, now: number): boolean {
    const expiry = this.cooldowns.get(index);
    return expiry !== undefined && expiry > now;
  }
}
