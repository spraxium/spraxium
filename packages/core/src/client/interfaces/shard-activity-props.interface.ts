/**
 * Custom key-value pairs that can be interpolated into activity name templates
 * alongside the built-in shard props.
 *
 * Built-in props are resolved automatically from the Discord client and do NOT
 * need to be passed here:
 *   {{shardId}}       , Current shard ID (0-based)
 *   {{shardNumber}}   , Current shard number (1-based, i.e. shardId + 1)
 *   {{totalShards}}   , Total number of shards
 *   {{totalServers}}  , Number of guilds on this shard
 *   {{ping}}          , WebSocket heartbeat latency in milliseconds
 *
 * @example
 * PresenceManager.setShardActivity(0, {
 *   name: 'v{{version}} · {{totalServers}} servers on shard {{shardNumber}}/{{totalShards}}',
 *   type: 'Playing',
 * }, { version: '2.0.0' });
 */
export interface ShardActivityProps {
  [key: string]: string | number | boolean | undefined;
}
