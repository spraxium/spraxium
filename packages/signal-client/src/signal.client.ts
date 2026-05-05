import { AllWebhooksRateLimitedError } from './errors/all-webhooks-rate-limited.error';
import { SignalClientError } from './errors/signal-client.error';
import { SignalPayloadTooLargeError } from './errors/signal-payload-too-large.error';
import { FallbackWorker } from './fallback/fallback.worker';
import type { FallbackConfig, FallbackStore } from './fallback/interfaces';
import type { SendOptions } from './interfaces/send-options.interface';
import type { SignalClientConfig } from './interfaces/signal-client-config.interface';
import type { SignalEnvelope } from './interfaces/signal-envelope.interface';
import { SignalEnvelopeBuilder } from './signal-envelope.builder';
import type { RateLimitStrategy } from './types/rate-limit-strategy.type';
import { WebhookPool } from './webhook.pool';

const DEFAULT_RATE_LIMIT_MS = 1_000;

function parseRetryAfterMs(response: Response): number {
  const header = response.headers.get('retry-after');
  if (!header) return DEFAULT_RATE_LIMIT_MS;
  const seconds = Number.parseFloat(header);
  return Number.isFinite(seconds) ? Math.ceil(seconds * 1_000) : DEFAULT_RATE_LIMIT_MS;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Sends signed signal envelopes to a Discord channel via webhooks.
 *
 * Automatically rotates through `webhookUrls` and tracks Discord 429 rate
 * limits per webhook. When a rate limit is hit, the client skips that webhook
 * and tries the next available one.
 *
 * @example
 * const client = new SignalClient({
 *   webhookUrls: [process.env.WEBHOOK_1!, process.env.WEBHOOK_2!],
 *   hmacSecret:  process.env.SIGNAL_HMAC_SECRET!,
 *   rateLimitStrategy: 'wait',
 * });
 *
 * await client.send('config.update', guildId, { prefix: '!' });
 *
 * // inspect pool state at any time:
 * console.log(client.pool.status());
 */
export class SignalClient {
  private readonly builder: SignalEnvelopeBuilder;
  private readonly _pool: WebhookPool;
  private readonly strategy: RateLimitStrategy;
  private readonly _fallback: FallbackWorker | undefined;

  constructor(config: SignalClientConfig, fallbackStore?: FallbackStore) {
    this.builder = new SignalEnvelopeBuilder(config.hmacSecret);
    this._pool = new WebhookPool(config.webhookUrls);
    this.strategy = config.rateLimitStrategy ?? 'skip';

    if (config.fallback?.enabled) {
      this._fallback = new FallbackWorker(this, config.fallback, fallbackStore);
      this._fallback.start();
    }
  }

  get pool(): WebhookPool {
    return this._pool;
  }

  get fallback(): FallbackWorker | undefined {
    return this._fallback;
  }

  destroy(): void {
    this._fallback?.stop();
  }

  /**
   * Delivers a pre-built, signed envelope without constructing a new one.
   * Use this for retries where the original nonce and signature must be
   * preserved (e.g. {@link FallbackWorker}).
   *
   * @throws {SignalClientError} on non-2xx, non-429 HTTP responses.
   * @throws {AllWebhooksRateLimitedError} when all webhooks are rate-limited (strategy 'skip').
   * @throws {RangeError} if `options.webhookIndex` is out of bounds.
   */
  async sendEnvelope(envelope: SignalEnvelope, options: SendOptions = {}): Promise<void> {
    try {
      if (options.webhookIndex !== undefined) {
        await this.deliver(this._pool.get(options.webhookIndex), options.webhookIndex, envelope);
        return;
      }

      const entry = this._pool.next();
      if (!entry) {
        await this.handleAllRateLimited(envelope);
        return;
      }

      await this.deliver(entry.url, entry.index, envelope);
    } catch (err) {
      if (this._fallback?.shouldTrack(envelope.event) && !options.skipFallback) {
        await this._fallback.enqueue(envelope, envelope.event, envelope.guildId);
        return;
      }
      throw err;
    }
  }

  /**
   * Builds, signs, and delivers a signal envelope.
   *
   * On HTTP 429, the rate-limited webhook is marked in the pool and the next
   * available one is tried automatically. If all are rate-limited, behaviour
   * depends on `rateLimitStrategy`:
   * - `'skip'` -> throws `AllWebhooksRateLimitedError`
   * - `'wait'` -> waits for the soonest cooldown, then retries once
   *
   * @param event   Event name (e.g. `'config.update'`).
   * @param guildId Target guild ID.
   * @param payload Free-form data the handler will receive.
   * @param options Per-send overrides.
   *
   * @throws {SignalClientError} on non-2xx, non-429 HTTP responses.
   * @throws {AllWebhooksRateLimitedError} when all webhooks are rate-limited (strategy 'skip').
   * @throws {RangeError} if `options.webhookIndex` is out of bounds.
   */
  async send(
    event: string,
    guildId: string,
    payload: Record<string, unknown> = {},
    options: SendOptions = {},
  ): Promise<void> {
    return this.sendEnvelope(this.builder.build(event, guildId, payload), options);
  }

  private async deliver(url: string, index: number, envelope: SignalEnvelope): Promise<void> {
    const serialized = JSON.stringify(envelope);
    if (serialized.length > 1900) {
      throw new SignalPayloadTooLargeError(envelope.event, envelope.guildId, serialized.length);
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: serialized }),
    });

    if (response.status === 429) {
      this._pool.markRateLimited(index, parseRetryAfterMs(response));

      const next = this._pool.next();
      if (next) {
        await this.deliver(next.url, next.index, envelope);
        return;
      }

      await this.handleAllRateLimited(envelope);
      return;
    }

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new SignalClientError(
        `Signal delivery failed: HTTP ${response.status} , ${response.statusText}`,
        response.status,
        body,
      );
    }
  }

  private async handleAllRateLimited(envelope: SignalEnvelope): Promise<void> {
    if (this.strategy === 'wait') {
      await sleep(this._pool.msUntilAvailable());
      const entry = this._pool.next();
      if (entry) {
        await this.deliver(entry.url, entry.index, envelope);
        return;
      }
    }

    throw new AllWebhooksRateLimitedError(this._pool.status());
  }
}
