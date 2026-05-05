import 'reflect-metadata';
import { ConfigurationException } from '@spraxium/core';
import { SCHEDULE_METADATA_KEYS } from '../constants/metadata-keys.constant';
import type { RunOnceJobMetadata } from '../interfaces/run-once-job-metadata.interface';
import type { RunOnceOptions } from '../interfaces/run-once-options.interface';

/**
 * Schedules a method to run exactly once at a specific date and time.
 *
 * Unlike `@Cron`, `@Interval`, or `@Timeout`, the job fires at an absolute moment
 * in the future rather than a relative delay or recurring pattern. After execution,
 * the job is automatically unregistered - it will not appear in `ScheduleService.getAll()`
 * afterwards.
 *
 * If the provided date is already in the past when the bot boots, the job is
 * registered but will never fire (a warning is emitted to the log).
 *
 * @param date - The exact `Date` at which the method should be called.
 * @param options.name - Unique name for the job. Mainly useful for logging.
 * @param options.disabled - If `true`, the job is registered but never executed.
 *
 * @example
 * // Send an announcement exactly once at a scheduled event date
 * \@RunOnce(new Date('2026-12-31T23:00:00Z'))
 * async sendNewYearAnnouncement() {
 *   await this.channel.send('🎉 Happy New Year!');
 * }
 *
 * @example
 * // Using a named job so it can be tracked via ScheduleService
 * \@RunOnce(LAUNCH_DATE, { name: 'product-launch-ping' })
 * async pingLaunch() {
 *   await this.notifier.ping();
 * }
 */
export function RunOnce(date: Date, options: RunOnceOptions = {}): MethodDecorator {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new ConfigurationException({
      key: 'runOnce',
      reason: '@RunOnce requires a valid Date instance',
    });
  }

  return (target, propertyKey, _descriptor) => {
    const meta: RunOnceJobMetadata = { date, ...options };
    Reflect.defineMetadata(SCHEDULE_METADATA_KEYS.RUN_ONCE, meta, target as object, propertyKey);
  };
}
