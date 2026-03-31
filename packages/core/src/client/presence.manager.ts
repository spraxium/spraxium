import type { Client, PresenceStatusData } from 'discord.js';
import { spraxiumError } from '../utils';
import { ACTIVITY_TYPE_MAP } from './constants';
import { mergePresence } from './helpers';
import type {
  ActivityOptions,
  PresenceOptions,
  PresenceStatus,
  ShardActivityProps,
  ShardOverride,
} from './interfaces';

/**
 * Static presence management API , accessible from anywhere in the application.
 *
 * Activity names support `{{key}}` placeholder interpolation. The following
 * built-in variables are automatically resolved from the Discord client on every
 * presence update , no need to pass them manually:
 *
 *   {{shardId}}       , Current shard ID (0-based)
 *   {{shardNumber}}   , Current shard number (1-based)
 *   {{totalShards}}   , Total number of shards
 *   {{totalServers}}  , Number of guilds on this shard
 *   {{ping}}          , WebSocket heartbeat latency (ms)
 *
 * Additional custom variables can be supplied via setShardActivity().
 *
 * @example
 * PresenceManager.setActivity({ name: 'Watching {{totalServers}} servers', type: 'Watching' })
 * PresenceManager.startRotation([...activities], 30_000)
 * PresenceManager.setShardActivity(0, { name: 'Shard {{shardNumber}}/{{totalShards}}', type: 'Playing' })
 */
export class PresenceManager {
  private static client: Client<true> | undefined;
  private static bootPresence: PresenceOptions | undefined;
  private static rotationTimer: ReturnType<typeof setInterval> | null = null;
  private static rotationIndex = 0;
  private static rotationList: Array<ActivityOptions> = [];
  private static currentStatus: PresenceStatus = 'online';
  private static currentActivity: ActivityOptions | undefined;
  private static shardOverrides = new Map<number, ShardOverride>();

  /**
   * @internal , Called once by SpraxiumApplication inside client.once('ready').
   * Application code must never call this directly.
   */
  public static initialize(client: Client<true>, presence?: PresenceOptions): void {
    PresenceManager.client = client;
    PresenceManager.bootPresence = presence;

    if (!presence) return;

    const shardId = client.shard?.ids[0];
    const effective =
      shardId !== undefined && presence.perShard?.[shardId]
        ? mergePresence(presence, presence.perShard[shardId])
        : presence;

    PresenceManager.currentStatus = effective.status ?? 'online';
    PresenceManager.currentActivity = effective.activities?.[0];
    PresenceManager.rotationList = effective.activities ?? [];
    PresenceManager.applyPresence();

    if (effective.rotateInterval && PresenceManager.rotationList.length > 1) {
      PresenceManager.startRotation(PresenceManager.rotationList, effective.rotateInterval);
    }
  }

  private static assertReady(): void {
    if (!PresenceManager.client) {
      spraxiumError(
        'PresenceManager',
        'called before the bot was ready',
        [
          'A static PresenceManager method was called before the Discord client',
          'connected. The presence API is only available after the ready event fires.',
        ],
        [
          'Move this call inside a @Listener() handler for the clientReady event,',
          'or inside an onBoot() lifecycle hook , both run after login completes.',
          "Example: client.once('clientReady', () => PresenceManager.setActivity(...))",
        ],
      );
    }
  }

  /** Resolves the built-in {{key}} variables from the current client state. */
  private static buildBuiltInProps(): Record<string, string | number> {
    const client = PresenceManager.client;
    if (!client) return {};

    const shardId = client.shard?.ids[0] ?? 0;
    const totalShards = client.shard?.count ?? 1;

    return {
      shardId,
      shardNumber: shardId + 1,
      totalShards,
      totalServers: client.guilds.cache.size,
      ping: client.ws.ping,
    };
  }

  /**
   * Resolves `{{key}}` placeholders in an activity name.
   * Built-in props are always injected; customProps are merged on top.
   */
  private static resolveActivity(
    activity: ActivityOptions,
    customProps?: ShardActivityProps,
  ): ActivityOptions {
    const builtIn = PresenceManager.buildBuiltInProps();
    const all: Record<string, string | number | boolean | undefined> = { ...builtIn, ...customProps };

    const name = activity.name.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
      const value = all[key];
      return value !== undefined ? String(value) : `{{${key}}}`;
    });

    return { ...activity, name };
  }

  /**
   * Applies the current in-memory presence state to the Discord client.
   * Built-in `{{key}}` placeholders are re-resolved on every call so values
   * like {{totalServers}} stay up-to-date.
   * @internal
   */
  public static applyPresence(): void {
    const client = PresenceManager.client;
    if (!client?.user) return;

    const shardId = client.shard?.ids[0];
    const override = shardId !== undefined ? PresenceManager.shardOverrides.get(shardId) : undefined;

    const status = override?.status ?? PresenceManager.currentStatus;
    const rawActivity = override?.activities?.[0] ?? PresenceManager.currentActivity;
    const activity = rawActivity
      ? PresenceManager.resolveActivity(rawActivity, override?.customProps)
      : undefined;

    client.user.setPresence({
      status: status as PresenceStatusData,
      activities: activity
        ? [{ name: activity.name, type: ACTIVITY_TYPE_MAP[activity.type], url: activity.url }]
        : [],
    });
  }

  /** Updates only the status indicator without touching the current activity. */
  public static setStatus(status: PresenceStatus): void {
    PresenceManager.assertReady();
    PresenceManager.currentStatus = status;
    PresenceManager.applyPresence();
  }

  /** Replaces the current activity without touching the status. */
  public static setActivity(activity: ActivityOptions): void {
    PresenceManager.assertReady();
    PresenceManager.currentActivity = activity;
    PresenceManager.applyPresence();
  }

  /** Sets status and/or activities in one call. */
  public static setPresence(options: Pick<PresenceOptions, 'status' | 'activities'>): void {
    PresenceManager.assertReady();
    if (options.status) PresenceManager.currentStatus = options.status;
    if (options.activities?.length) {
      PresenceManager.currentActivity = options.activities[0];
      PresenceManager.rotationList = options.activities;
    }
    PresenceManager.applyPresence();
  }

  /**
   * Starts (or replaces) automatic activity rotation.
   * Any existing rotation is stopped first.
   * The interval is unref()'d so it never blocks clean shutdown.
   */
  public static startRotation(activities: Array<ActivityOptions>, intervalMs: number): void {
    PresenceManager.assertReady();
    PresenceManager.stopRotation();

    if (activities.length === 0) return;

    PresenceManager.rotationList = activities;
    PresenceManager.rotationIndex = 0;
    PresenceManager.currentActivity = activities[0];
    PresenceManager.applyPresence();

    const timer = setInterval(() => {
      PresenceManager.rotationIndex =
        (PresenceManager.rotationIndex + 1) % PresenceManager.rotationList.length;
      PresenceManager.currentActivity = PresenceManager.rotationList[PresenceManager.rotationIndex];
      PresenceManager.applyPresence();
    }, intervalMs);

    timer.unref();
    PresenceManager.rotationTimer = timer;
  }

  /** Clears the rotation interval. The last active activity is kept. */
  public static stopRotation(): void {
    if (PresenceManager.rotationTimer) {
      clearInterval(PresenceManager.rotationTimer);
      PresenceManager.rotationTimer = null;
    }
  }

  /**
   * Restores the exact presence configured at boot time.
   * Per-shard runtime overrides are NOT cleared , call clearShardPresence(id) first
   * if you want a full reset.
   */
  public static reset(): void {
    PresenceManager.assertReady();
    PresenceManager.stopRotation();

    const p = PresenceManager.bootPresence;
    if (p) {
      PresenceManager.currentStatus = p.status ?? 'online';
      PresenceManager.currentActivity = p.activities?.[0];
      PresenceManager.rotationList = p.activities ?? [];
      PresenceManager.applyPresence();

      if (p.rotateInterval && PresenceManager.rotationList.length > 1) {
        PresenceManager.startRotation(PresenceManager.rotationList, p.rotateInterval);
      }
    } else {
      PresenceManager.currentStatus = 'online';
      PresenceManager.currentActivity = undefined;
      PresenceManager.rotationList = [];
      PresenceManager.applyPresence();
    }
  }

  /**
   * Sets a presence override for a specific shard ID.
   * On the matching shard process, this overrides the global presence for
   * every subsequent applyPresence() call.
   */
  public static setShardPresence(
    shardId: number,
    options: Partial<Pick<PresenceOptions, 'status' | 'activities'>>,
  ): void {
    PresenceManager.assertReady();
    const existing = PresenceManager.shardOverrides.get(shardId) ?? {};
    PresenceManager.shardOverrides.set(shardId, { ...existing, ...options });
    PresenceManager.applyPresence();
  }

  /** Removes the override for a specific shard, falling back to the global presence. */
  public static clearShardPresence(shardId: number): void {
    PresenceManager.assertReady();
    PresenceManager.shardOverrides.delete(shardId);
    PresenceManager.applyPresence();
  }

  /**
   * Sets the activity for a specific shard with optional custom `{{key}}` props.
   * Built-in props ({{totalServers}}, {{shardNumber}}, etc.) are always available
   * and do not need to be passed in `customProps`.
   *
   * @example
   * PresenceManager.setShardActivity(0, {
   *   name: 'v{{version}} · {{totalServers}} servers on shard {{shardNumber}}/{{totalShards}}',
   *   type: 'Playing',
   * }, { version: '2.0.0' });
   */
  public static setShardActivity(
    shardId: number,
    activity: ActivityOptions,
    customProps?: ShardActivityProps,
  ): void {
    PresenceManager.assertReady();
    const existing = PresenceManager.shardOverrides.get(shardId) ?? {};
    PresenceManager.shardOverrides.set(shardId, { ...existing, activities: [activity], customProps });
    PresenceManager.applyPresence();
  }

  /** Removes only the activity override for a specific shard, keeping any status override. */
  public static clearShardActivity(shardId: number): void {
    PresenceManager.assertReady();
    const existing = PresenceManager.shardOverrides.get(shardId);
    if (!existing) return;

    const { activities: _a, customProps: _c, ...rest } = existing;
    if (Object.keys(rest).length === 0) {
      PresenceManager.shardOverrides.delete(shardId);
    } else {
      PresenceManager.shardOverrides.set(shardId, rest);
    }
    PresenceManager.applyPresence();
  }
}
