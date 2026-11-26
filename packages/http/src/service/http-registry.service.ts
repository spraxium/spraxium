import type { ShardingManager } from 'discord.js';

/** @deprecated Use Spraxium RPC for bot calls. See https://spraxium.com/en/guide/rpc-http-migration. */
export class HttpRegistry {
  static shardingManager: ShardingManager | undefined;

  static reset(): void {
    HttpRegistry.shardingManager = undefined;
  }
}
