import type { NonceStore } from '../security/nonce-store.interface';

/**
 * Opt-in persistence for the nonce deduplication cache. Set to `true` to use
 * the default file-backed store at `.spraxium/signal-nonces.json`, or pass an
 * object to customise the location or plug a custom store implementation.
 */
export type PersistNoncesOption =
  | true
  | {
      /** Filesystem path for the default file-backed store. */
      readonly path?: string;
      /**
       * Custom {@link NonceStore} implementation. When provided, `path` is
       * ignored. Useful for Redis-backed or multi-process deployments.
       */
      readonly store?: NonceStore;
    };

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

  /**
   * Persist seen nonces across process restarts to prevent replay attacks
   * that exploit the restart window. Defaults to `false` (in-memory only).
   *
   * @example
   *   // Default file location (`.spraxium/signal-nonces.json`):
   *   persistNonces: true
   *
   * @example
   *   // Custom path:
   *   persistNonces: { path: '/var/lib/mybot/nonces.json' }
   *
   * @example
   *   // Custom store (Redis, SQL, etc.):
   *   persistNonces: { store: new MyRedisNonceStore(redisClient) }
   */
  persistNonces?: PersistNoncesOption;
}
