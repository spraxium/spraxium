/**
 * The fixed protocol envelope carried in every signal message.
 * Serialised as JSON in the Discord message's `content` field.
 */
export interface SignalEnvelope {
  /** Protocol version — always 1. */
  readonly v: 1;
  /** Event identifier in the format "domain.action". */
  readonly event: string;
  /** The target guild ID for this signal. */
  readonly guildId: string;
  /** UUID unique per send, used for deduplication. */
  readonly nonce: string;
  /** Unix timestamp in milliseconds of when the signal was sent. */
  readonly sentAt: number;
  /** HMAC-SHA256 hex string, verified before the envelope is dispatched. */
  readonly signature: string;
  /** Free-form payload, validated by the handler's Zod schema. */
  readonly payload: unknown;
}
