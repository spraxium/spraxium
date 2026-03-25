import type { ActivityOptions } from './activity-options.interface';

export interface PresenceOptions {
  /** Bot status indicator. Defaults to 'online'. */
  status?: 'online' | 'idle' | 'dnd' | 'invisible';
  /** One or more activities. When rotateInterval is set and length > 1, they rotate automatically. */
  activities?: Array<ActivityOptions>;
  /** Milliseconds between each activity rotation step. Only effective when activities.length > 1. */
  rotateInterval?: number;
  /**
   * Per-shard presence overrides. When running in sharded mode, a shard whose ID
   * matches a key in this record will use that config merged over the global presence
   * at boot time.
   *
   * For runtime overrides use PresenceManager.setShardPresence().
   *
   * @example
   * perShard: {
   *   0: { status: 'dnd', activities: [{ name: 'Shard 0', type: 'Playing' }] },
   * }
   */
  perShard?: Record<number, Partial<Pick<PresenceOptions, 'status' | 'activities' | 'rotateInterval'>>>;
}
