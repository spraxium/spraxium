import type { ClientOptions, GatewayIntentBits, Partials } from 'discord.js';
import type { ShardOptions } from '../../client/interfaces/shard-options.interface';

export interface SpraxiumOptions {
  token?: string;
  partials?: Array<Partials>;
  clientOptions?: Omit<ClientOptions, 'intents' | 'partials'>;
  intents?: Array<GatewayIntentBits>;
  /**
   * Enable sharding. When set, SpraxiumApplication.listen() will spawn a
   * Discord.js ShardingManager in the parent process instead of connecting
   * directly. Each child process re-runs the entry script and boots normally.
   */
  sharding?: ShardOptions;
}
