import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { SCHEDULE_METADATA_KEYS } from '../../src/constants/metadata-keys.constant';
import type { AfterOnlineJobMetadata } from '../../src/interfaces/after-online-job-metadata.interface';
import type { CronJobMetadata } from '../../src/interfaces/cron-job-metadata.interface';
import type { IntervalJobMetadata } from '../../src/interfaces/interval-job-metadata.interface';
import type { TimeoutJobMetadata } from '../../src/interfaces/timeout-job-metadata.interface';
import { ScheduleTester } from '../../src/testing/schedule.tester';

class ExampleService {
  called = false;

  cronTask() {
    this.called = true;
  }

  intervalTask() {}
  timeoutTask() {}
  afterOnlineTask() {}
  unmanagedTask() {}
}

Reflect.defineMetadata(
  SCHEDULE_METADATA_KEYS.CRON,
  { expression: '* * * * *', name: 'cron-task' } satisfies CronJobMetadata,
  ExampleService.prototype,
  'cronTask',
);
Reflect.defineMetadata(
  SCHEDULE_METADATA_KEYS.INTERVAL,
  { ms: 1_000, name: 'interval-task' } satisfies IntervalJobMetadata,
  ExampleService.prototype,
  'intervalTask',
);
Reflect.defineMetadata(
  SCHEDULE_METADATA_KEYS.TIMEOUT,
  { ms: 500, name: 'timeout-task' } satisfies TimeoutJobMetadata,
  ExampleService.prototype,
  'timeoutTask',
);
Reflect.defineMetadata(
  SCHEDULE_METADATA_KEYS.AFTER_ONLINE,
  { ms: 200, name: 'after-online-task' } satisfies AfterOnlineJobMetadata,
  ExampleService.prototype,
  'afterOnlineTask',
);

describe('ScheduleTester.run', () => {
  it('calls the given method on the instance', async () => {
    const svc = new ExampleService();
    await ScheduleTester.run(svc, 'cronTask');
    expect(svc.called).toBe(true);
  });

  it('throws when the method does not exist', async () => {
    const svc = new ExampleService();
    await expect(ScheduleTester.run(svc, 'nonExistent')).rejects.toThrow();
  });
});

describe('ScheduleTester.discover', () => {
  it('discovers all 4 decorated methods from a prototype', () => {
    const jobs = ScheduleTester.discover(ExampleService);
    expect(jobs).toHaveLength(4);
  });

  it('does not include undecorated methods', () => {
    const jobs = ScheduleTester.discover(ExampleService);
    const methods = jobs.map((j) => j.methodName);
    expect(methods).not.toContain('unmanagedTask');
  });

  it('returns correct metadata for a cron job', () => {
    const jobs = ScheduleTester.discover(ExampleService);
    const cron = jobs.find((j) => j.type === 'cron');
    expect(cron?.expression).toBe('* * * * *');
    expect(cron?.name).toBe('cron-task');
    expect(cron?.disabled).toBe(false);
  });
});

describe('ScheduleTester.runAll', () => {
  it('runs all decorated methods on the instance', async () => {
    let count = 0;
    class CountService {
      a() {
        count++;
      }
      b() {
        count++;
      }
      c() {}
    }
    Reflect.defineMetadata(
      SCHEDULE_METADATA_KEYS.CRON,
      { expression: '* * * * *' } satisfies CronJobMetadata,
      CountService.prototype,
      'a',
    );
    Reflect.defineMetadata(
      SCHEDULE_METADATA_KEYS.INTERVAL,
      { ms: 1_000 } satisfies IntervalJobMetadata,
      CountService.prototype,
      'b',
    );

    await ScheduleTester.runAll(new CountService());
    expect(count).toBe(2);
  });

  it('filters by job type when type is provided', async () => {
    let cronCount = 0;
    let intervalCount = 0;

    class FilterService {
      cronJob() {
        cronCount++;
      }
      intervalJob() {
        intervalCount++;
      }
    }
    Reflect.defineMetadata(
      SCHEDULE_METADATA_KEYS.CRON,
      { expression: '* * * * *' } satisfies CronJobMetadata,
      FilterService.prototype,
      'cronJob',
    );
    Reflect.defineMetadata(
      SCHEDULE_METADATA_KEYS.INTERVAL,
      { ms: 1_000 } satisfies IntervalJobMetadata,
      FilterService.prototype,
      'intervalJob',
    );

    await ScheduleTester.runAll(new FilterService(), 'cron');

    expect(cronCount).toBe(1);
    expect(intervalCount).toBe(0);
  });
});
