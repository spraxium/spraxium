import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SCHEDULE_METADATA_KEYS } from '../../src/constants/metadata-keys.constant';
import type { AfterOnlineJobMetadata } from '../../src/interfaces/after-online-job-metadata.interface';
import type { CronJobMetadata } from '../../src/interfaces/cron-job-metadata.interface';
import type { IntervalJobMetadata } from '../../src/interfaces/interval-job-metadata.interface';
import type { JobEntry } from '../../src/interfaces/job-entry.interface';
import type { TimeoutJobMetadata } from '../../src/interfaces/timeout-job-metadata.interface';
import { JobScanner } from '../../src/runtime/job.scanner';

vi.mock('@spraxium/core', () => ({
  Logger: vi.fn().mockImplementation(() => ({
    debug: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  })),
  ConfigurationException: class ConfigurationException extends Error {
    constructor({ reason }: { key: string; reason: string }) {
      super(reason);
      this.name = 'ConfigurationException';
    }
  },
}));

function makeInstance<T extends object>(proto: T): T {
  return Object.create(proto) as T;
}

describe('JobScanner', () => {
  let jobs: Map<string, JobEntry>;
  let pendingAfterOnline: Array<JobEntry>;
  let scanner: JobScanner;

  beforeEach(() => {
    jobs = new Map();
    pendingAfterOnline = [];
    scanner = new JobScanner(jobs, pendingAfterOnline);
  });

  it('ignores null input', () => {
    scanner.scan(null);
    expect(jobs.size).toBe(0);
  });

  it('ignores non-object input', () => {
    scanner.scan('string value');
    expect(jobs.size).toBe(0);
  });

  it('ignores an object with no scheduled methods', () => {
    scanner.scan({ plainMethod: () => {} });
    expect(jobs.size).toBe(0);
  });

  describe('cron job registration', () => {
    it('registers a cron job with an explicit name', () => {
      const proto = { tick: () => {} };
      const cronMeta: CronJobMetadata = { expression: '* * * * *', name: 'my-cron' };
      Reflect.defineMetadata(SCHEDULE_METADATA_KEYS.CRON, cronMeta, proto, 'tick');

      scanner.scan(makeInstance(proto));

      const entry = jobs.get('my-cron');
      expect(entry).toBeDefined();
      expect(entry?.type).toBe('cron');
      expect(entry?.expression).toBe('* * * * *');
      expect(entry?.running).toBe(false);
    });

    it('auto-generates a name when no name is provided', () => {
      const proto = { tick: () => {} };
      Reflect.defineMetadata(
        SCHEDULE_METADATA_KEYS.CRON,
        { expression: '* * * * *' } satisfies CronJobMetadata,
        proto,
        'tick',
      );

      scanner.scan(makeInstance(proto));

      expect(jobs.size).toBe(1);
      expect([...jobs.keys()][0]).toMatch(/^cron-\d+$/);
    });

    it('sets disabled flag from metadata', () => {
      const proto = { tick: () => {} };
      Reflect.defineMetadata(
        SCHEDULE_METADATA_KEYS.CRON,
        { expression: '* * * * *', name: 'disabled-job', disabled: true } satisfies CronJobMetadata,
        proto,
        'tick',
      );

      scanner.scan(makeInstance(proto));

      expect(jobs.get('disabled-job')?.disabled).toBe(true);
    });
  });

  describe('interval job registration', () => {
    it('registers an interval job', () => {
      const proto = { poll: () => {} };
      const meta: IntervalJobMetadata = { ms: 5_000, name: 'poller' };
      Reflect.defineMetadata(SCHEDULE_METADATA_KEYS.INTERVAL, meta, proto, 'poll');

      scanner.scan(makeInstance(proto));

      const entry = jobs.get('poller');
      expect(entry?.type).toBe('interval');
      expect(entry?.intervalMs).toBe(5_000);
    });

    it('auto-generates name for interval job', () => {
      const proto = { poll: () => {} };
      Reflect.defineMetadata(
        SCHEDULE_METADATA_KEYS.INTERVAL,
        { ms: 1_000 } satisfies IntervalJobMetadata,
        proto,
        'poll',
      );

      scanner.scan(makeInstance(proto));

      expect([...jobs.keys()][0]).toMatch(/^interval-\d+$/);
    });
  });

  describe('timeout job registration', () => {
    it('registers a timeout job', () => {
      const proto = { once: () => {} };
      const meta: TimeoutJobMetadata = { ms: 3_000, name: 'startup' };
      Reflect.defineMetadata(SCHEDULE_METADATA_KEYS.TIMEOUT, meta, proto, 'once');

      scanner.scan(makeInstance(proto));

      const entry = jobs.get('startup');
      expect(entry?.type).toBe('timeout');
      expect(entry?.intervalMs).toBe(3_000);
    });
  });

  describe('after-online job registration', () => {
    it('registers an after-online job', () => {
      const proto = { postBoot: () => {} };
      const meta: AfterOnlineJobMetadata = { ms: 2_000, name: 'post-boot' };
      Reflect.defineMetadata(SCHEDULE_METADATA_KEYS.AFTER_ONLINE, meta, proto, 'postBoot');

      scanner.scan(makeInstance(proto));

      const entry = jobs.get('post-boot');
      expect(entry?.type).toBe('after-online');
      expect(pendingAfterOnline).toHaveLength(1);
      expect(pendingAfterOnline[0]).toBe(entry);
    });
  });

  describe('error cases', () => {
    it('throws for a duplicate job name', () => {
      const proto1 = { tick: () => {} };
      const proto2 = { tick: () => {} };
      Reflect.defineMetadata(
        SCHEDULE_METADATA_KEYS.CRON,
        { expression: '* * * * *', name: 'dup' } satisfies CronJobMetadata,
        proto1,
        'tick',
      );
      Reflect.defineMetadata(
        SCHEDULE_METADATA_KEYS.CRON,
        { expression: '* * * * *', name: 'dup' } satisfies CronJobMetadata,
        proto2,
        'tick',
      );

      scanner.scan(makeInstance(proto1));
      expect(() => scanner.scan(makeInstance(proto2))).toThrow();
    });

    it('scans only the first matching decorator per method', () => {
      const proto = { work: () => {} };
      Reflect.defineMetadata(
        SCHEDULE_METADATA_KEYS.CRON,
        { expression: '* * * * *', name: 'job-a' } satisfies CronJobMetadata,
        proto,
        'work',
      );
      Reflect.defineMetadata(
        SCHEDULE_METADATA_KEYS.INTERVAL,
        { ms: 1_000, name: 'job-b' } satisfies IntervalJobMetadata,
        proto,
        'work',
      );

      scanner.scan(makeInstance(proto));

      expect(jobs.has('job-a')).toBe(true);
      expect(jobs.has('job-b')).toBe(false);
    });
  });

  describe('bound method execution', () => {
    it('binds the method to the instance', async () => {
      let called = false;
      const proto = {
        task: () => {
          called = true;
        },
      };
      Reflect.defineMetadata(
        SCHEDULE_METADATA_KEYS.TIMEOUT,
        { ms: 0, name: 'task-job' } satisfies TimeoutJobMetadata,
        proto,
        'task',
      );

      scanner.scan(makeInstance(proto));

      const entry = jobs.get('task-job');
      await entry?.fn();
      expect(called).toBe(true);
    });
  });
});
