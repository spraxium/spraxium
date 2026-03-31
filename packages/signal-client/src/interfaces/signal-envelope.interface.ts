/**
 * The complete signal protocol envelope.
 * Mirrors the type in @spraxium/signal without creating a cross-package
 * dependency — both packages are intentionally standalone.
 */
export interface SignalEnvelope {
  readonly v: 1;
  readonly event: string;
  readonly guildId: string;
  readonly nonce: string;
  readonly sentAt: number;
  readonly signature: string;
  readonly payload: unknown;
}
