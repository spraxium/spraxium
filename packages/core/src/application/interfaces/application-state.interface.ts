import type { Constructor } from '@spraxium/common';
import type { Client, GatewayIntentBits, Partials } from 'discord.js';
import type { ModuleLoader } from '../../bootstrap/module.loader';
import type { PresenceOptions } from '../../client/interfaces/presence-options.interface';
import type { ShardOptions } from '../../client/interfaces/shard-options.interface';

export interface ApplicationState {
  token?: string;
  intents?: Array<GatewayIntentBits>;
  partials?: Array<Partials>;
  presence?: PresenceOptions;
  sharding?: ShardOptions;
  rootModule?: Constructor;
  moduleLoader?: ModuleLoader;
  client?: Client;
  globalProviders: Map<unknown, unknown>;
}
