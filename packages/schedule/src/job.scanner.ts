import 'reflect-metadata';
import { ConfigurationException, Logger } from '@spraxium/core';
import { MESSAGES } from './constants/messages.constant';
import { SCHEDULE_METADATA_KEYS } from './constants/metadata-keys.constant';
import type { AfterOnlineJobMetadata } from './interfaces/after-online-job-metadata.interface';
import type { CronJobMetadata } from './interfaces/cron-job-metadata.interface';
import type { IntervalJobMetadata } from './interfaces/interval-job-metadata.interface';
import type { JobEntry } from './interfaces/job-entry.interface';
import type { TimeoutJobMetadata } from './interfaces/timeout-job-metadata.interface';
import type { JobType } from './types/job.type';
import { getNextRunDate } from './utils/cron.parser';

export class JobScanner {
  private readonly log = new Logger('JobScanner');
  private autoNameIdx = 0;

  constructor(
    private readonly jobs: Map<string, JobEntry>,
    private readonly pendingAfterOnline: Array<JobEntry>,
  ) {}

  private autoName(type: JobType): string {
    return `${type}-${++this.autoNameIdx}`;
  }

  scan(instance: unknown): void {
    if (!instance || typeof instance !== 'object') return;

    const proto = Object.getPrototypeOf(instance) as object;
    const methods = Object.getOwnPropertyNames(proto).filter((m) => m !== 'constructor');

    for (const method of methods) {
      this.scanMethod(instance, proto, method);
    }
  }

  private scanMethod(instance: unknown, proto: object, method: string): void {
    const cronMeta = Reflect.getMetadata(SCHEDULE_METADATA_KEYS.CRON, proto, method) as
      | CronJobMetadata
      | undefined;

    if (cronMeta) {
      this.registerCronJob(instance, method, cronMeta);
      return;
    }

    const intervalMeta = Reflect.getMetadata(SCHEDULE_METADATA_KEYS.INTERVAL, proto, method) as
      | IntervalJobMetadata
      | undefined;

    if (intervalMeta) {
      this.registerIntervalJob(instance, method, intervalMeta);
      return;
    }

    const timeoutMeta = Reflect.getMetadata(SCHEDULE_METADATA_KEYS.TIMEOUT, proto, method) as
      | TimeoutJobMetadata
      | undefined;

    if (timeoutMeta) {
      this.registerTimeoutJob(instance, method, timeoutMeta);
      return;
    }

    const afterOnlineMeta = Reflect.getMetadata(SCHEDULE_METADATA_KEYS.AFTER_ONLINE, proto, method) as
      | AfterOnlineJobMetadata
      | undefined;

    if (afterOnlineMeta) {
      this.registerAfterOnlineJob(instance, method, afterOnlineMeta);
    }
  }

  private registerCronJob(instance: unknown, method: string, meta: CronJobMetadata): void {
    const name = meta.name ?? this.autoName('cron');
    this.assertUniqueName(name);

    const entry: JobEntry = {
      name,
      type: 'cron',
      expression: meta.expression,
      timezone: meta.timezone,
      fn: this.bindMethod(instance, method, name),
      running: false,
      disabled: meta.disabled ?? false,
      runOnInit: meta.runOnInit ?? false,
      nextRun: getNextRunDate(meta.expression, meta.timezone),
      runCount: 0,
    };

    this.jobs.set(name, entry);
    this.log.debug(MESSAGES.CRON_REGISTERED(name, meta.expression, meta.timezone));
  }

  private registerIntervalJob(instance: unknown, method: string, meta: IntervalJobMetadata): void {
    const name = meta.name ?? this.autoName('interval');
    this.assertUniqueName(name);

    const entry: JobEntry = {
      name,
      type: 'interval',
      intervalMs: meta.ms,
      fn: this.bindMethod(instance, method, name),
      running: false,
      disabled: meta.disabled ?? false,
      runOnInit: meta.runOnInit ?? false,
      nextRun: new Date(Date.now() + meta.ms),
      runCount: 0,
    };

    this.jobs.set(name, entry);
    this.log.debug(MESSAGES.INTERVAL_REGISTERED(name, meta.ms));
  }

  private registerTimeoutJob(instance: unknown, method: string, meta: TimeoutJobMetadata): void {
    const name = meta.name ?? this.autoName('timeout');
    this.assertUniqueName(name);

    const entry: JobEntry = {
      name,
      type: 'timeout',
      intervalMs: meta.ms,
      fn: this.bindMethod(instance, method, name),
      running: false,
      disabled: meta.disabled ?? false,
      runOnInit: false,
      nextRun: new Date(Date.now() + meta.ms),
      runCount: 0,
    };

    this.jobs.set(name, entry);
    this.log.debug(MESSAGES.TIMEOUT_REGISTERED(name, meta.ms));
  }

  private registerAfterOnlineJob(instance: unknown, method: string, meta: AfterOnlineJobMetadata): void {
    const name = meta.name ?? this.autoName('after-online');
    this.assertUniqueName(name);

    const entry: JobEntry = {
      name,
      type: 'after-online',
      intervalMs: meta.ms,
      fn: this.bindMethod(instance, method, name),
      running: false,
      disabled: meta.disabled ?? false,
      runOnInit: false,
      nextRun: new Date(Date.now() + meta.ms),
      runCount: 0,
    };

    this.jobs.set(name, entry);
    this.pendingAfterOnline.push(entry);
    this.log.debug(MESSAGES.AFTER_ONLINE_REGISTERED(name, meta.ms));
  }

  private assertUniqueName(name: string): void {
    if (this.jobs.has(name)) {
      throw new ConfigurationException({
        key: 'schedule',
        reason: MESSAGES.DUPLICATE_JOB_NAME(name),
      });
    }
  }

  private bindMethod(instance: unknown, method: string, jobName: string): () => Promise<void> {
    const obj = instance as Record<string, unknown>;
    const fn = obj[method];

    if (typeof fn !== 'function') {
      const className = (Object.getPrototypeOf(instance as object) as { constructor: { name: string } })
        .constructor.name;

      throw new ConfigurationException({
        key: 'schedule',
        reason: MESSAGES.METHOD_NOT_FUNCTION(method, className, jobName),
      });
    }

    return (fn as (...args: Array<unknown>) => unknown).bind(instance) as () => Promise<void>;
  }
}
