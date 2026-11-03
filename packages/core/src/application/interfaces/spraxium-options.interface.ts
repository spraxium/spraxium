import type { ClientOptions, GatewayIntentBits, Partials } from 'discord.js';
import type { ShardOptions } from '../../client/interfaces/shard-options.interface';

export interface SpraxiumOptions {
  token?: string;
  partials?: Array<Partials>;
  clientOptions?: Omit<ClientOptions, 'intents' | 'partials'>;
  intents?: Array<GatewayIntentBits>;
  sharding?: ShardOptions;
  /**
   * How long `listen()` waits for the gateway READY event before destroying
   * the client and rejecting with a `READY_TIMEOUT` startup error.
   * @default 30000
   */
  readyTimeoutMs?: number;
  /**
   * When `true` (default), startup failures such as a missing or rejected
   * token print a diagnostic and terminate the process. Set to `false` when
   * embedding the application in a host that manages several bots: `listen()`
   * then rejects with a `SpraxiumStartupError` (keeping the original cause),
   * releases the process lock, and leaves no pending ready timer.
   * @default true
   */
  exitOnStartupFailure?: boolean;
}
