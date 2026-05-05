import 'reflect-metadata';
import { MESSAGES } from '../constants/messages.constant';
import { SCHEDULE_METADATA_KEYS } from '../constants/metadata-keys.constant';
import type { AfterOnlineJobMetadata } from '../interfaces/after-online-job-metadata.interface';
import type { CronJobMetadata } from '../interfaces/cron-job-metadata.interface';
import type { DiscoveredJob } from '../interfaces/discovered-job.interface';
import type { IntervalJobMetadata } from '../interfaces/interval-job-metadata.interface';
import type { RunOnceJobMetadata } from '../interfaces/run-once-job-metadata.interface';
import type { TimeoutJobMetadata } from '../interfaces/timeout-job-metadata.interface';
import type { JobType } from '../types/job.type';

export class ScheduleTester {
  static async run(instance: object, methodName: string): Promise<void> {
    const fn = (instance as Record<string, unknown>)[methodName];

    if (typeof fn !== 'function') {
      throw new Error(MESSAGES.TESTER_NOT_A_METHOD(methodName, instance.constructor.name));
    }

    await (fn as (...args: Array<unknown>) => unknown).call(instance);
  }

  static async runAll(instance: object, type?: JobType): Promise<void> {
    const jobs = ScheduleTester.discover(instance.constructor as new () => object);
    const filtered = type ? jobs.filter((j) => j.type === type) : jobs;

    for (const job of filtered) {
      await ScheduleTester.run(instance, job.methodName);
    }
  }

  static discover(target: (new (...args: Array<unknown>) => object) | object): Array<DiscoveredJob> {
    const proto =
      typeof target === 'function'
        ? ((target as new () => object).prototype as object)
        : (Object.getPrototypeOf(target) as object);

    const methods = Object.getOwnPropertyNames(proto).filter((m) => m !== 'constructor');
    const jobs: Array<DiscoveredJob> = [];

    for (const method of methods) {
      const cronMeta = Reflect.getMetadata(SCHEDULE_METADATA_KEYS.CRON, proto, method) as
        | CronJobMetadata
        | undefined;

      if (cronMeta) {
        jobs.push({
          methodName: method,
          type: 'cron',
          expression: cronMeta.expression,
          name: cronMeta.name,
          disabled: cronMeta.disabled ?? false,
        });
        continue;
      }

      const intervalMeta = Reflect.getMetadata(SCHEDULE_METADATA_KEYS.INTERVAL, proto, method) as
        | IntervalJobMetadata
        | undefined;

      if (intervalMeta) {
        jobs.push({
          methodName: method,
          type: 'interval',
          intervalMs: intervalMeta.ms,
          name: intervalMeta.name,
          disabled: intervalMeta.disabled ?? false,
        });
        continue;
      }

      const timeoutMeta = Reflect.getMetadata(SCHEDULE_METADATA_KEYS.TIMEOUT, proto, method) as
        | TimeoutJobMetadata
        | undefined;

      if (timeoutMeta) {
        jobs.push({
          methodName: method,
          type: 'timeout',
          intervalMs: timeoutMeta.ms,
          name: timeoutMeta.name,
          disabled: timeoutMeta.disabled ?? false,
        });
        continue;
      }

      const afterOnlineMeta = Reflect.getMetadata(SCHEDULE_METADATA_KEYS.AFTER_ONLINE, proto, method) as
        | AfterOnlineJobMetadata
        | undefined;

      if (afterOnlineMeta) {
        jobs.push({
          methodName: method,
          type: 'after-online',
          intervalMs: afterOnlineMeta.ms,
          name: afterOnlineMeta.name,
          disabled: afterOnlineMeta.disabled ?? false,
        });
        continue;
      }

      const runOnceMeta = Reflect.getMetadata(SCHEDULE_METADATA_KEYS.RUN_ONCE, proto, method) as
        | RunOnceJobMetadata
        | undefined;

      if (runOnceMeta) {
        jobs.push({
          methodName: method,
          type: 'run-once',
          name: runOnceMeta.name,
          disabled: runOnceMeta.disabled ?? false,
        });
      }
    }

    return jobs;
  }
}
