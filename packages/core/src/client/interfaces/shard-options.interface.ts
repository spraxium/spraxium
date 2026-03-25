/**
 * Configuration for Discord.js ShardingManager.
 * Only used when SpraxiumOptions.sharding is provided.
 */
export interface ShardOptions {
  /**
   * Total number of shards to spawn, or 'auto' to let Discord decide.
   * 'auto' requires a valid bot token at spawn time.
   */
  totalShards: number | 'auto';
  /** Subset of shard IDs to spawn. Omit to spawn all shards. */
  shardList?: Array<number>;
  /** Whether to respawn a shard if it crashes. Defaults to true. */
  respawn?: boolean;
  /**
   * Delay in milliseconds between spawning each shard.
   * Defaults to 5500 to respect Discord's identify rate limit.
   */
  spawnDelay?: number;
}
