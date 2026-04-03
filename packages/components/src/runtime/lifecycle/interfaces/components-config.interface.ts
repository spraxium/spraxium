import type { ModalErrorEmbed, ModalValidationError } from '../../../components/modal';
import type { ContextErrorMessage } from './context-error-message.type';
import type { ContextStorageConfig } from './context-storage-config.type';

export interface ComponentsConfig {
  modal?: {
    /** Custom embed builder for field validation errors shown to the user. */
    validationEmbed?: (errors: Array<ModalValidationError>) => ModalErrorEmbed;
  };
  button?: {
    /** When `true`, expired-context and restricted-access replies are sent ephemerally. Defaults to `true`. */
    ephemeralErrors?: boolean;
  };
  select?: {
    /** When `true`, expired-context and restricted-access replies are sent ephemerally. Defaults to `true`. */
    ephemeralErrors?: boolean;
  };
  /** Override the default human-readable error messages sent when a context check fails. */
  errorMessages?: {
    /** Shown when the flow context has expired. Defaults to `'❌ This interaction has expired.'` */
    expired?: ContextErrorMessage;
    /** Shown when the user is not the context owner. Defaults to `'❌ You are not allowed to use this component.'` */
    restricted?: ContextErrorMessage;
  };
  /** Flow-context storage configuration. */
  context?: {
    /**
     * Storage backend to use for flow contexts.
     *
     * - `'memory'` — in-process Map, data lost on restart (default).
     * - `'file'` — JSON snapshot in `.spraxium/contexts.json`, survives restarts.
     * - `{ type: 'file'; dir?: string }` — file adapter with a custom directory.
     * - `{ type: 'sqlite'; path?: string }` — SQLite via `better-sqlite3` (requires `pnpm add better-sqlite3`). Row-level storage, no full-file rewrite, ACID.
     * - `{ type: 'redis'; ... }` — Redis via ioredis (requires `pnpm add ioredis`).
     */
    storage?: ContextStorageConfig;
    /**
     * Default TTL in seconds applied when `ContextService.create()` is called
     * without an explicit `ttl` option. Defaults to `300` (5 minutes).
     */
    defaultTtl?: number;
  };
}
