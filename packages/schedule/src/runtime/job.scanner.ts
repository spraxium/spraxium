import { ConfigurationException } from '@spraxium/core';
import { logger } from '@spraxium/logger';
import { MESSAGES } from '../constants/messages.constant';
import type { JobEntry } from '../interfaces/job-entry.interface';
import { JobMetadataReader } from '../metadata/job-metadata.reader';
import type { JobMetadata } from '../types/job-metadata.type';
import { CronParser } from '../utils/cron.parser';
import { ScheduledMethodInvoker } from './scheduled-method.invoker';

export class JobScanner {
  private readonly scanned = new WeakSet<object>();

  constructor(
    private readonly jobs: Map<string, JobEntry>,
    private readonly reader = new JobMetadataReader(),
  ) {}

  scan(instance: unknown): Array<JobEntry> {
    if (!instance || typeof instance !== 'object' || this.scanned.has(instance)) return [];
    const entries: Array<JobEntry> = [];
    const names = new Set(this.jobs.keys());
    for (const method of this.reader.read(instance)) {
      const entry = this.createEntry(instance, method.methodName, method.metadata);
      if (names.has(entry.name))
        throw new ConfigurationException({
          key: 'schedule',
          reason: MESSAGES.DUPLICATE_JOB_NAME(entry.name),
        });
      names.add(entry.name);
      entries.push(entry);
    }
    for (const entry of entries) {
      this.jobs.set(entry.name, entry);
      this.logRegistration(entry);
    }
    this.scanned.add(instance);
    return entries;
  }

  private createEntry(instance: object, name: string | symbol, metadata: JobMetadata): JobEntry {
    const method = new ScheduledMethodInvoker(instance, name);
    const entry: JobEntry = {
      name: metadata.name ?? `${metadata.type}-${this.className(instance)}.${String(name)}`,
      type: metadata.type,
      fn: method.execute.bind(method),
      disabled: metadata.disabled ?? false,
      running: false,
      paused: false,
      executing: false,
      runOnInit: 'runOnInit' in metadata && metadata.runOnInit === true,
      runCount: 0,
      description: metadata.description,
    };
    if (metadata.type === 'cron') {
      CronParser.validate(metadata.expression, metadata.timezone);
      entry.expression = metadata.expression;
      entry.timezone = metadata.timezone;
    } else if (metadata.type === 'run-once') entry.runAt = new Date(metadata.date);
    else entry.intervalMs = metadata.ms;
    return entry;
  }

  private logRegistration(job: JobEntry): void {
    switch (job.type) {
      case 'cron':
        logger.debug(MESSAGES.CRON_REGISTERED(job.name, job.expression ?? '', job.timezone));
        break;
      case 'interval':
        logger.debug(MESSAGES.INTERVAL_REGISTERED(job.name, job.intervalMs ?? 0));
        break;
      case 'timeout':
        logger.debug(MESSAGES.TIMEOUT_REGISTERED(job.name, job.intervalMs ?? 0));
        break;
      case 'after-online':
        logger.debug(MESSAGES.AFTER_ONLINE_REGISTERED(job.name, job.intervalMs ?? 0));
        break;
      case 'run-once':
        logger.debug(MESSAGES.RUN_ONCE_REGISTERED(job.name, job.runAt?.toISOString() ?? ''));
        break;
    }
  }

  private className(instance: object): string {
    const prototype = Object.getPrototypeOf(instance);
    const instanceConstructor: unknown =
      prototype && Object.getOwnPropertyDescriptor(prototype, 'constructor')?.value;
    return typeof instanceConstructor === 'function' && instanceConstructor.name
      ? instanceConstructor.name
      : 'Object';
  }
}
