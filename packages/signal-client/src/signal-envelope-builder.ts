import { createHmac, randomUUID } from 'node:crypto';
import type { SignalEnvelope } from './interfaces/signal-envelope.interface';

/**
 * Builds and cryptographically signs signal envelopes.
 *
 * Signature algorithm: HMAC-SHA256 over the message string
 * `${nonce}.${sentAt}.${JSON.stringify(payload)}` — identical to the
 * verification formula used by @spraxium/signal on the receiver side.
 */
export class SignalEnvelopeBuilder {
  constructor(private readonly hmacSecret: string) {}

  /**
   * Constructs a complete, signed envelope ready for transmission.
   */
  build(event: string, guildId: string, payload: Record<string, unknown>): SignalEnvelope {
    const nonce = randomUUID();
    const sentAt = Date.now();
    const signature = this.sign(nonce, sentAt, payload);
    return { v: 1, event, guildId, nonce, sentAt, signature, payload };
  }

  private sign(nonce: string, sentAt: number, payload: unknown): string {
    const message = `${nonce}.${sentAt}.${JSON.stringify(payload)}`;
    return createHmac('sha256', this.hmacSecret).update(message).digest('hex');
  }
}
