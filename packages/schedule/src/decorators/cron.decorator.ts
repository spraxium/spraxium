import 'reflect-metadata';
import { SCHEDULE_METADATA_KEYS } from '../constants/metadata-keys.constant';
import type { CronJobMetadata } from '../interfaces/cron-job-metadata.interface';
import type { CronOptions } from '../interfaces/cron-options.interface';
import { validateCronExpression } from '../utils/cron.parser';

/**
 * Schedules a method to run on a cron expression.
 *
 * The expression follows the standard 5-field cron format (`min hour dom month dow`),
 * or 6-field with seconds as the first field (`sec min hour dom month dow`).
 * You can also use any constant from `CronExpression` instead of writing the string by hand.
 *
 * The job runs as long as no other instance holds the distributed lock for it.
 * With `MemoryDriver` (default), the lock is always acquired. With `RedisScheduleDriver`,
 * only one instance across the cluster will execute at a time.
 *
 * @param expression - Cron expression string, e.g. `'0 * * * *'` (every hour).
 * @param options.name - Unique name for the job. Defaults to an auto-generated name.
 *   Use a stable name if you want to pause/resume/destroy the job via `ScheduleService`.
 * @param options.runOnInit - If `true`, the method is also called once immediately when
 *   the bot boots, before the first scheduled run.
 * @param options.disabled - If `true`, the job is registered but never started.
 *   Useful to ship a job that can be re-enabled without a redeploy.
 * @param options.timezone - IANA timezone for scheduling, e.g. `'America/Sao_Paulo'`.
 *   Overrides the global `timezone` set in `defineSchedule`.
 *
 * @example
 * // Run every day at midnight
 * \@Cron('0 0 * * *')
 * async dailyReset() {
 *   await this.db.clearExpired();
 * }
 *
 * @example
 * // Using a built-in constant, run immediately on boot too
 * \@Cron(CronExpression.EVERY_HOUR, { runOnInit: true, name: 'sync-roles' })
 * async syncRoles() {
 *   await this.guild.syncRoles();
 * }
 */
export function Cron(expression: string, options: CronOptions = {}): MethodDecorator {
  validateCronExpression(expression);

  return (target, propertyKey, _descriptor) => {
    const meta: CronJobMetadata = { expression, ...options };
    Reflect.defineMetadata(SCHEDULE_METADATA_KEYS.CRON, meta, target as object, propertyKey);
  };
}
