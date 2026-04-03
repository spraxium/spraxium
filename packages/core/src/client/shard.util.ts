/**
 * Returns `true` when the current process was spawned by a discord.js
 * ShardingManager (i.e. it is a shard child process).
 *
 * discord.js injects the `SHARDS` environment variable into every child
 * process it spawns, so this is a reliable way to detect shard workers.
 */
export function isShardChild(): boolean {
  return typeof process.env.SHARDS !== 'undefined';
}
