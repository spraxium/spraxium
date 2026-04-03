import type { SignalEnvelope } from '../interfaces/signal-envelope.interface';

export interface FallbackEntry {
  readonly id: string;
  readonly envelope: SignalEnvelope;
  readonly event: string;
  readonly guildId: string;
  readonly attempts: number;
  readonly nextAttemptAt: number;
  readonly createdAt: number;
  readonly lastError?: string;
}

export interface FallbackStore {
  enqueue(entry: FallbackEntry): Promise<void>;
  claimBatch(limit: number, now: number): Promise<FallbackEntry[]>;
  markProcessed(id: string): Promise<void>;
  reschedule(id: string, nextAttemptAt: number, reason: string, attempts: number): Promise<void>;
  moveToDeadLetter(entry: FallbackEntry, reason: string): Promise<void>;
  has(id: string): Promise<boolean>;
  pendingCount(): Promise<number>;
  deadLetterCount(): Promise<number>;
}

export interface FallbackConfig {
  readonly enabled: boolean;
  readonly store: 'file' | 'redis';
  readonly retryIntervalMs?: number;
  readonly maxAttempts?: number;
  readonly batchSize?: number;
  readonly events?: string[];
  readonly filePath?: string;
  readonly redisUrl?: string;
}

export const FALLBACK_DEFAULTS = {
  retryIntervalMs: 5_000,
  maxAttempts: 10,
  batchSize: 20,
  filePath: '.spraxium-signal-fallback.json',
} as const;
