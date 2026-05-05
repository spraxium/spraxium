import type { SignalEnvelope } from '../interfaces/signal-envelope.interface';
import type { SignalClient } from '../signal.client';
import { FileFallbackStore } from './file.store';
import type { FallbackConfig, FallbackEntry, FallbackStore } from './interfaces';
import { FALLBACK_DEFAULTS } from './interfaces';

export class FallbackWorker {
  private timer: ReturnType<typeof setInterval> | undefined;
  private readonly store: FallbackStore;
  private readonly retryIntervalMs: number;
  private readonly maxAttempts: number;
  private readonly batchSize: number;
  private readonly trackedEvents: Set<string> | null;

  constructor(
    private readonly client: SignalClient,
    config: FallbackConfig,
    customStore?: FallbackStore,
  ) {
    this.retryIntervalMs = config.retryIntervalMs ?? FALLBACK_DEFAULTS.retryIntervalMs;
    this.maxAttempts = config.maxAttempts ?? FALLBACK_DEFAULTS.maxAttempts;
    this.batchSize = config.batchSize ?? FALLBACK_DEFAULTS.batchSize;
    this.trackedEvents = config.events ? new Set(config.events) : null;

    if (customStore) {
      this.store = customStore;
    } else if (config.store === 'file') {
      this.store = new FileFallbackStore(config.filePath ?? FALLBACK_DEFAULTS.filePath);
    } else {
      throw new Error(
        'Fallback store "redis" requires a custom store instance. Pass it via the customStore parameter or use store: "file".',
      );
    }
  }

  get fallbackStore(): FallbackStore {
    return this.store;
  }

  shouldTrack(event: string): boolean {
    if (!this.trackedEvents) return true;
    return this.trackedEvents.has(event);
  }

  async enqueue(envelope: SignalEnvelope, event: string, guildId: string): Promise<void> {
    if (!this.shouldTrack(event)) return;

    const alreadyExists = await this.store.has(envelope.nonce);
    if (alreadyExists) return;

    const entry: FallbackEntry = {
      id: envelope.nonce,
      envelope,
      event,
      guildId,
      attempts: 0,
      nextAttemptAt: Date.now() + this.retryIntervalMs,
      createdAt: Date.now(),
    };

    await this.store.enqueue(entry);
  }

  start(): void {
    if (this.timer) return;
    this.timer = setInterval(() => {
      this.processBatch().catch((err) => {
        const message = err instanceof Error ? err.message : String(err);
        process.emitWarning(`Signal fallback worker batch failed: ${message}`);
      });
    }, this.retryIntervalMs);
    if (this.timer.unref) this.timer.unref();
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  async processBatch(): Promise<void> {
    const now = Date.now();
    const batch = await this.store.claimBatch(this.batchSize, now);

    for (const entry of batch) {
      await this.retryEntry(entry);
    }
  }

  private async retryEntry(entry: FallbackEntry): Promise<void> {
    const attempt = entry.attempts + 1;

    try {
      await this.client.sendEnvelope(entry.envelope, { skipFallback: true });
      await this.store.markProcessed(entry.id);
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);

      if (attempt >= this.maxAttempts) {
        await this.store.moveToDeadLetter(entry, reason);
        return;
      }

      const backoff = this.retryIntervalMs * 2 ** Math.min(attempt, 8);
      const jitter = Math.random() * this.retryIntervalMs * 0.3;
      const nextAttemptAt = Date.now() + backoff + jitter;

      await this.store.reschedule(entry.id, nextAttemptAt, reason, attempt);
    }
  }

  async stats(): Promise<{ pending: number; deadLetter: number }> {
    return {
      pending: await this.store.pendingCount(),
      deadLetter: await this.store.deadLetterCount(),
    };
  }
}
