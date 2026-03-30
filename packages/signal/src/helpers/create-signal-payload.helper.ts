import { randomUUID } from 'node:crypto';
import type { UnsignedEnvelope } from '../types';

/**
 * Builds a well-formed unsigned `SignalEnvelope` for testing
 * or external senders that handle signing themselves.
 */
export function createSignalPayload(
  event: string,
  guildId: string,
  payload: Record<string, unknown> = {},
): UnsignedEnvelope {
  return { v: 1, event, guildId, nonce: randomUUID(), sentAt: Date.now(), payload };
}
