import 'reflect-metadata';
import { ConfigurationException } from '@spraxium/core';
import { MESSAGES } from '../constants/messages.constant';
import { SCHEDULE_METADATA_KEYS } from '../constants/metadata-keys.constant';
import type { TimeoutJobMetadata } from '../interfaces/timeout-job-metadata.interface';
import type { TimeoutOptions } from '../interfaces/timeout-options.interface';

/**
 * Schedules a method to run once, after a delay from boot time.
 *
 * The method is called exactly once after `ms` milliseconds from when the bot finishes
 * booting (`onBoot`). After execution, the job is automatically unregistered — it will
 * not appear in `ScheduleService.getAll()` afterwards.
 *
 * Use this for deferred one-shot work that depends on the application being ready,
 * but doesn't need to wait for the Discord ready event. If you need to wait for
 * the bot to be fully connected and the ready event to fire, use `@AfterOnline` instead.
 *
 * @param ms - Delay in milliseconds. `0` is valid and fires as soon as the event loop is free.
 * @param options.name - Unique name for the job. Mainly useful for logging.
 * @param options.disabled - If `true`, the job is registered but never executed.
 *
 * @example
 * // Log a message 10 seconds after startup
 * \@Timeout(10_000)
 * async logStartupComplete() {
 *   this.logger.info('Application fully warmed up.');
 * }
 *
 * @example
 * // Using a constant
 * \@Timeout(TimeoutExpression.AFTER_30_SECONDS, { name: 'initial-sync' })
 * async initialSync() {
 *   await this.syncService.run();
 * }
 */
export function Timeout(ms: number, options: TimeoutOptions = {}): MethodDecorator {
  if (ms < 0) {
    throw new ConfigurationException({
      key: 'timeoutMs',
      reason: MESSAGES.TIMEOUT_NEGATIVE_MS(ms),
    });
  }

  return (target, propertyKey, _descriptor) => {
    const meta: TimeoutJobMetadata = { ms, ...options };
    Reflect.defineMetadata(SCHEDULE_METADATA_KEYS.TIMEOUT, meta, target as object, propertyKey);
  };
}
