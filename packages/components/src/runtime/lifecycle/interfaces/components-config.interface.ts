import type { Interaction } from 'discord.js';
import type { ModalErrorEmbed, ModalValidationError } from '../../../components/modal';
import type { ContextErrorMessage } from '../types/context-error-message.type';
import type { ContextStorageConfig } from '../types/context-storage-config.type';

/**
 * Reply payload sent to the user when a component handler throws an unhandled
 * error.
 *
 * - `string`: sent as ephemeral plain text.
 * - `ModalErrorEmbed`: sent as an ephemeral embed.
 * - `(err, interaction) => string | ModalErrorEmbed`: built at throw time.
 */
export type HandlerErrorReply =
  | string
  | ModalErrorEmbed
  | ((err: unknown, interaction: Interaction) => string | ModalErrorEmbed);

export interface ComponentsConfig {
  modal?: {
    /** Custom embed builder for field validation errors shown to the user. */
    validationEmbed?: (errors: Array<ModalValidationError>) => ModalErrorEmbed;
  };
  button?: {
    /** When `true`, expired-context and restricted-access replies are sent ephemerally. Defaults to `true`. */
    ephemeralErrors?: boolean;
    /**
     * Reply sent when a `@ButtonHandler` / `@DynamicButtonHandler` throws an
     * unhandled error. Defaults to a generic ephemeral message.
     */
    onErrorReply?: HandlerErrorReply;
  };
  select?: {
    /** When `true`, expired-context and restricted-access replies are sent ephemerally. Defaults to `true`. */
    ephemeralErrors?: boolean;
    /**
     * Reply sent when a select handler throws an unhandled error. Defaults to
     * a generic ephemeral message.
     */
    onErrorReply?: HandlerErrorReply;
  };
  /** Override the default human-readable error messages sent when a context check fails. */
  errorMessages?: {
    /** Shown when the flow context has expired. Defaults to `'❌ This interaction has expired.'` */
    expired?: ContextErrorMessage;
    /** Shown when the user is not the context owner. Defaults to `'❌ You are not allowed to use this component.'` */
    restricted?: ContextErrorMessage;
    /** Shown when a payload (`~p:<id>`) cannot be found (expired or invalid). */
    payloadExpired?: ContextErrorMessage;
  };
  /**
   * Global hook invoked whenever a component handler throws. Useful for
   * structured logging or error reporting. The default implementation calls
   * `console.error`.
   */
  onError?: (err: unknown, ctx: { interaction: Interaction; handler: string }) => void | Promise<void>;
  /** Flow-context storage configuration. */
  context?: {
    /**
     * Storage backend to use for flow contexts.
     *
     * - `'memory'`: in-process Map, data lost on restart (default).
     * - `'file'`: JSON snapshot in `.spraxium/contexts.json`, survives restarts.
     * - `{ type: 'file'; dir?: string }`: file adapter with a custom directory.
     * - `{ type: 'sqlite'; path?: string }`: SQLite via `better-sqlite3` (requires `pnpm add better-sqlite3`). Row-level storage, no full-file rewrite, ACID.
     * - `{ type: 'redis'; ... }`: Redis via ioredis (requires `pnpm add ioredis`).
     */
    storage?: ContextStorageConfig;
    /**
     * Default TTL in seconds applied when `ContextService.create()` is called
     * without an explicit `ttl` option. Defaults to `300` (5 minutes).
     * Set to `0` to make contexts permanent by default.
     */
    defaultTtl?: number;
  };
}
