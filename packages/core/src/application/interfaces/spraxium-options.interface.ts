import type { ClientOptions, GatewayIntentBits, Partials } from 'discord.js';
import type { ShardOptions } from '../../client/interfaces/shard-options.interface';

export interface SpraxiumOptions {
  token?: string;
  partials?: Array<Partials>;
  clientOptions?: Omit<ClientOptions, 'intents' | 'partials'>;
  intents?: Array<GatewayIntentBits>;
  sharding?: ShardOptions;
}
