import 'reflect-metadata';
import { ConfigurationException } from '@spraxium/core';
import { MESSAGES } from '../constants/messages.constant';
import { SCHEDULE_METADATA_KEYS } from '../constants/metadata-keys.constant';
import type { IntervalJobMetadata } from '../interfaces/interval-job-metadata.interface';
import type { IntervalOptions } from '../interfaces/interval-options.interface';

/**
 * Schedules a method to run repeatedly at a fixed interval.
 *
 * The interval starts after the bot boots and ticks every `ms` milliseconds,
 * without any drift accumulation. If the previous execution takes longer than
 * the interval, the next tick still fires on schedule.
 *
 * Unlike `@Cron`, there is no expression parsing — this is a simple `setInterval` under the hood,
 * wrapped with the distributed lock so only one instance runs per tick in a cluster.
 *
 * @param ms - Interval in milliseconds. Must be greater than 0.
 * @param options.name - Unique name for the job. Defaults to an auto-generated name.
 *   Use a stable name if you want to control the job via `ScheduleService`.
 * @param options.runOnInit - If `true`, the method is also called once immediately on boot.
 * @param options.disabled - If `true`, the job is registered but never started.
 *
 * @example
 * // Check the voice channel every 30 seconds
 * \@Interval(30_000)
 * async checkVoiceChannel() {
 *   const channel = await this.client.channels.fetch(CHANNEL_ID);
 *   // ...
 * }
 *
 * @example
 * // Use a named constant and run immediately
 * \@Interval(IntervalExpression.EVERY_5_MINUTES, { runOnInit: true, name: 'presence-update' })
 * async updatePresence() {
 *   await this.client.user?.setPresence({ activities: [{ name: 'watching members' }] });
 * }
 */
export function Interval(ms: number, options: IntervalOptions = {}): MethodDecorator {
  if (ms <= 0) {
    throw new ConfigurationException({
      key: 'intervalMs',
      reason: MESSAGES.INTERVAL_NEGATIVE_MS(ms),
    });
  }

  return (target, propertyKey, _descriptor) => {
    const meta: IntervalJobMetadata = { ms, ...options };
    Reflect.defineMetadata(SCHEDULE_METADATA_KEYS.INTERVAL, meta, target as object, propertyKey);
  };
}
