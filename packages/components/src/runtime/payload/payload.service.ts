import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import { Injectable } from '@spraxium/common';
import { ContextStore } from '../context';
import type { SpraxiumContext } from '../context';

const PAYLOAD_PREFIX = 'payload:';

/** Default TTL (seconds) for payloads created without an explicit `ttl` option. */
const DEFAULT_PAYLOAD_TTL = 600;

export interface PayloadEnvelope<T> {
  id: string;
  data: T;
  createdAt: number;
  expiresAt: number;
}

export interface CreatePayloadOptions {
  /** TTL in seconds. Defaults to 600 (10 minutes). */
  ttl?: number;
}

/**
 * Stores small per-button / per-option payloads keyed by short ids that are
 * embedded into custom IDs as `~p:<id>`.
 *
 * The payload channel is independent from the flow context channel (`~ctx:<id>`)
 * — they can coexist on the same custom ID. Payloads piggyback on the global
 * `ContextStore` adapter (memory/file/sqlite/redis) using a `payload:` prefix.
 */
@Injectable()
export class PayloadService {
  /** Generates a 12-char random id (compact for Discord's 100-char custom ID budget). */
  private generateId(): string {
    return randomUUID().replace(/-/g, '').slice(0, 12);
  }

  async create<T>(data: T, options?: CreatePayloadOptions): Promise<PayloadEnvelope<T>> {
    const ttl = options?.ttl ?? DEFAULT_PAYLOAD_TTL;
    const now = Date.now();
    const id = this.generateId();
    const envelope: PayloadEnvelope<T> = {
      id,
      data,
      createdAt: now,
      expiresAt: now + ttl * 1_000,
    };
    // Reuse ContextStore as the persistence backbone.
    await ContextStore.set({
      id: `${PAYLOAD_PREFIX}${id}`,
      data: envelope,
      createdAt: now,
      ttl,
      expiresAt: envelope.expiresAt,
    } as SpraxiumContext<unknown>);
    return envelope;
  }

  async get<T>(id: string): Promise<T | undefined> {
    const ctx = await ContextStore.get<PayloadEnvelope<T>>(`${PAYLOAD_PREFIX}${id}`);
    return ctx?.data?.data;
  }

  async getEnvelope<T>(id: string): Promise<PayloadEnvelope<T> | undefined> {
    const ctx = await ContextStore.get<PayloadEnvelope<T>>(`${PAYLOAD_PREFIX}${id}`);
    return ctx?.data;
  }

  async delete(id: string): Promise<void> {
    await ContextStore.delete(`${PAYLOAD_PREFIX}${id}`);
  }
}
