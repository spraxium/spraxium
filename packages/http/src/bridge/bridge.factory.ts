import type { Client, ShardingManager } from 'discord.js';
import type { BotBridge } from '../interfaces';
import { DirectBotBridge } from './direct-bot.bridge';
import { ShardedBotBridge } from './sharded-bot.bridge';

export class BridgeFactory {
  static create(client?: Client, manager?: ShardingManager): BotBridge {
    if (manager) {
      return new ShardedBotBridge(manager);
    }

    if (client) {
      return new DirectBotBridge(client);
    }

    throw new Error('BridgeFactory requires either a Client or ShardingManager instance.');
  }
}
