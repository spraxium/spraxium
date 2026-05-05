/**
 * Thrown by {@link SignalClient} when a signal payload would exceed Discord's
 * 2000-character webhook content limit after serialization.
 *
 * Inspect {@link measuredLength} to understand the over-budget size.
 * The effective limit is set conservatively (1900 chars) to leave headroom
 * for the outer JSON wrapper added during delivery.
 */
export class SignalPayloadTooLargeError extends Error {
  constructor(
    public readonly event: string,
    public readonly guildId: string,
    public readonly measuredLength: number,
    public readonly limit: number = 1900,
  ) {
    super(
      `Signal payload for event "${event}" (guild ${guildId}) exceeds the serialization limit: ${measuredLength} chars (limit: ${limit}). Reduce the payload size or split the event into smaller messages.`,
    );
    this.name = 'SignalPayloadTooLargeError';
  }
}
