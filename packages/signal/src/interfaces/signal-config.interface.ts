/**
 * Configuration for the Signal plugin.
 * Pass this to `defineSignal()` in `defineConfig({ plugins: [...] })`.
 */
export interface SignalConfig {
  /**
   * ID (or array of IDs) of the private Discord channel(s) used as the signal transport.
   * Only messages received in one of these channels will be processed.
   */
  channelId: string | Array<string>;

  /**
   * Whitelist of webhook IDs authorised to publish signals.
   * Messages from webhooks not in this list are silently rejected.
   */
  allowedWebhookIds: Array<string>;

  /**
   * Shared HMAC-SHA256 secret used to verify incoming signal envelopes.
   * Must match the `hmacSecret` configured in @spraxium/signal-client.
   */
  hmacSecret: string;

  /**
   * Whether to delete the signal message from the channel after processing.
   * Uses fire-and-forget semantics , failures are silently ignored.
   * Defaults to false.
   */
  deleteAfterProcessing?: boolean;

  /**
   * Enable verbose debug logging for the signal pipeline.
   * When true, each validation rule and pipeline step emits a log entry.
   * Should be disabled in production. Defaults to false.
   */
  debug?: boolean;
}
