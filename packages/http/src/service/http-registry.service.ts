import type { ShardingManager } from 'discord.js';

export class HttpRegistry {
  static shardingManager: ShardingManager | undefined;

  static reset(): void {
    HttpRegistry.shardingManager = undefined;
  }
}
