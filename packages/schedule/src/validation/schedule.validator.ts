import { ConfigurationException } from '@spraxium/core';
import type { ScheduleConfig } from '../interfaces/schedule-config.interface';
import type { ScheduleDriver } from '../interfaces/schedule-driver.interface';
import type { JobMetadata } from '../types/job-metadata.type';
import type { JobType } from '../types/job.type';

export class ScheduleValidator {
  static parseMetadata(value: object, type: JobType): JobMetadata {
    const common = {
      name: ScheduleValidator.optionalString('name' in value ? value.name : undefined, 'schedule.name'),
      description: ScheduleValidator.optionalString(
        'description' in value ? value.description : undefined,
        'schedule.description',
      ),
      disabled: ScheduleValidator.optionalBoolean(
        'disabled' in value ? value.disabled : undefined,
        'schedule.disabled',
      ),
    };
    if (type === 'cron') {
      if (!('expression' in value) || typeof value.expression !== 'string')
        ScheduleValidator.invalidMetadata();
      return {
        ...common,
        type,
        expression: value.expression,
        timezone: ScheduleValidator.optionalString(
          'timezone' in value ? value.timezone : undefined,
          'schedule.timezone',
        ),
        runOnInit: ScheduleValidator.optionalBoolean(
          'runOnInit' in value ? value.runOnInit : undefined,
          'schedule.runOnInit',
        ),
      };
    }
    if (type === 'run-once') {
      if (!('date' in value) || !(value.date instanceof Date)) ScheduleValidator.invalidMetadata();
      return { ...common, type, date: new Date(value.date) };
    }
    if (!('ms' in value) || typeof value.ms !== 'number') ScheduleValidator.invalidMetadata();
    if (type === 'interval')
      return {
        ...common,
        type,
        ms: value.ms,
        runOnInit: ScheduleValidator.optionalBoolean(
          'runOnInit' in value ? value.runOnInit : undefined,
          'schedule.runOnInit',
        ),
      };
    return { ...common, type, ms: value.ms };
  }

  static milliseconds(value: number, minimum: number, key: string): void {
    if (
      !Number.isSafeInteger(value) ||
      value < minimum ||
      !Number.isFinite(new Date(Date.now() + value).getTime())
    ) {
      throw new ConfigurationException({
        key,
        reason: `Expected a finite integer of at least ${minimum} milliseconds within the Date range, got ${value}`,
      });
    }
  }

  static timezone(timezone?: string): void {
    if (timezone === undefined) return;
    try {
      if (typeof timezone !== 'string' || timezone.trim().length === 0) throw new Error('Empty timezone');
      new Intl.DateTimeFormat('en', { timeZone: timezone }).format();
    } catch {
      throw new ConfigurationException({ key: 'schedule.timezone', reason: `Invalid timezone: ${timezone}` });
    }
  }

  static metadata(metadata: JobMetadata): void {
    if (
      metadata.name !== undefined &&
      (typeof metadata.name !== 'string' || metadata.name.trim().length === 0 || metadata.name.includes('\0'))
    ) {
      throw new ConfigurationException({
        key: 'schedule.name',
        reason: 'Job names must be nonempty strings without NUL characters',
      });
    }
    if (metadata.disabled !== undefined && typeof metadata.disabled !== 'boolean') {
      throw new ConfigurationException({ key: 'schedule.disabled', reason: 'disabled must be a boolean' });
    }
    if (metadata.description !== undefined && typeof metadata.description !== 'string') {
      throw new ConfigurationException({
        key: 'schedule.description',
        reason: 'description must be a string',
      });
    }
    if (
      'runOnInit' in metadata &&
      metadata.runOnInit !== undefined &&
      typeof metadata.runOnInit !== 'boolean'
    ) {
      throw new ConfigurationException({ key: 'schedule.runOnInit', reason: 'runOnInit must be a boolean' });
    }
    if (metadata.type === 'cron') ScheduleValidator.timezone(metadata.timezone);
    else if (metadata.type === 'run-once') {
      if (!(metadata.date instanceof Date) || !Number.isFinite(metadata.date.getTime())) {
        throw new ConfigurationException({
          key: 'runOnce',
          reason: '@RunOnce requires a valid Date instance',
        });
      }
    } else
      ScheduleValidator.milliseconds(metadata.ms, metadata.type === 'interval' ? 1 : 0, `${metadata.type}Ms`);
  }

  static driver(driver: ScheduleDriver): void {
    if (
      !driver ||
      typeof driver.init !== 'function' ||
      typeof driver.destroy !== 'function' ||
      typeof driver.acquireLock !== 'function' ||
      typeof driver.releaseLock !== 'function' ||
      (driver.renewLock !== undefined && typeof driver.renewLock !== 'function')
    ) {
      throw new ConfigurationException({
        key: 'schedule.driver',
        reason: 'Invalid ScheduleDriver implementation',
      });
    }
  }

  static config(config: ScheduleConfig): void {
    ScheduleValidator.timezone(config.timezone);
    if (config.defaultLockTtlMs !== undefined) {
      ScheduleValidator.milliseconds(config.defaultLockTtlMs, 1, 'schedule.defaultLockTtlMs');
      if (config.defaultLockTtlMs > 2_147_483_647)
        throw new ConfigurationException({
          key: 'schedule.defaultLockTtlMs',
          reason: 'Lock TTL must not exceed 2147483647 milliseconds',
        });
    }
    if (config.disableAll !== undefined && typeof config.disableAll !== 'boolean')
      throw new ConfigurationException({
        key: 'schedule.disableAll',
        reason: 'disableAll must be a boolean',
      });
    if (config.driver !== undefined) ScheduleValidator.driver(config.driver);
  }

  private static optionalString(value: unknown, key: string): string | undefined {
    if (value === undefined || typeof value === 'string') return value;
    throw new ConfigurationException({ key, reason: 'Expected a string' });
  }

  private static optionalBoolean(value: unknown, key: string): boolean | undefined {
    if (value === undefined || typeof value === 'boolean') return value;
    throw new ConfigurationException({ key, reason: 'Expected a boolean' });
  }

  private static invalidMetadata(): never {
    throw new ConfigurationException({ key: 'schedule', reason: 'Invalid schedule metadata' });
  }
}
