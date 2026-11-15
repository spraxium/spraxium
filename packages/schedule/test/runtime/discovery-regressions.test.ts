import 'reflect-metadata';
import { ConfigurationException } from '@spraxium/core';
import { describe, expect, it, vi } from 'vitest';
import { SCHEDULE_METADATA_KEYS } from '../../src/constants/metadata-keys.constant';
import { Cron } from '../../src/decorators/cron.decorator';
import { Interval } from '../../src/decorators/interval.decorator';
import { RunOnce } from '../../src/decorators/run-once.decorator';
import { Timeout } from '../../src/decorators/timeout.decorator';
import type { JobEntry } from '../../src/interfaces/job-entry.interface';
import { JobScanner } from '../../src/runtime/job.scanner';
import { ScheduleTester } from '../../src/testing/schedule.tester';

describe('Schedule discovery regressions', () => {
  it('discovers inherited and symbol methods and preserves their receiver', async () => {
    const symbol = Symbol('task');
    class Parent {
      count = 0;
      @Interval(100, { name: 'inherited' })
      task() {
        this.count++;
      }
      @Timeout(100, { name: 'symbol' })
      [symbol]() {
        this.count++;
      }
    }
    class Child extends Parent {}
    const instance = new Child();
    const jobs = new Map<string, JobEntry>();
    new JobScanner(jobs).scan(instance);
    await jobs.get('inherited')?.fn();
    await jobs.get('symbol')?.fn();
    expect(instance.count).toBe(2);
    expect(ScheduleTester.discover(Child)).toHaveLength(2);
    expect(ScheduleTester.discover(instance)).toHaveLength(2);
    await ScheduleTester.runAll(instance);
    expect(instance.count).toBe(4);
  });

  it('does not inherit a schedule from an overridden undecorated method', () => {
    class Parent {
      @Interval(100)
      task() {}
    }
    class Child extends Parent {
      override task() {}
    }
    expect(ScheduleTester.discover(Child)).toEqual([]);
  });

  it('preserves decorators when a method is bound in the constructor', async () => {
    class Tasks {
      count = 0;
      constructor() {
        this.task = this.task.bind(this);
      }
      @Interval(100, { name: 'bound' })
      task() {
        this.count++;
      }
    }
    const instance = new Tasks();
    const jobs = new Map<string, JobEntry>();
    new JobScanner(jobs).scan(instance);
    await jobs.get('bound')?.fn();
    expect(instance.count).toBe(1);
    expect(ScheduleTester.discover(instance)).toHaveLength(1);
  });

  it('does not evaluate getters while discovering scheduled methods', () => {
    const getter = vi.fn(() => {
      throw new Error('must not be read');
    });
    const instance: object = Object.create(null);
    Object.defineProperty(instance, 'explosive', { get: getter });
    Object.defineProperty(instance, 'constructor', { get: getter });
    expect(ScheduleTester.discover(instance)).toEqual([]);
    expect(getter).not.toHaveBeenCalled();
  });

  it('supports a scheduled own method on an object without a prototype', async () => {
    const instance: object = Object.create(null);
    const fn = vi.fn();
    Object.defineProperty(instance, 'task', { value: fn });
    Reflect.defineMetadata(SCHEDULE_METADATA_KEYS.INTERVAL, { ms: 100 }, instance, 'task');
    const jobs = new Map<string, JobEntry>();
    new JobScanner(jobs).scan(instance);
    await jobs.get('interval-Object.task')?.fn();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('does not register an AfterOnline instance twice', () => {
    const instance = { task() {} };
    Reflect.defineMetadata(SCHEDULE_METADATA_KEYS.AFTER_ONLINE, { ms: 0 }, instance, 'task');
    const jobs = new Map<string, JobEntry>();
    const scanner = new JobScanner(jobs);
    scanner.scan(instance);
    expect(scanner.scan(instance)).toEqual([]);
    expect(jobs.size).toBe(1);
  });

  it('produces the same automatic names regardless of discovery order', () => {
    class First {
      @Interval(100)
      task() {}
    }
    class Second {
      @Interval(100)
      task() {}
    }
    const left = new Map<string, JobEntry>();
    const right = new Map<string, JobEntry>();
    const scannerA = new JobScanner(left);
    const scannerB = new JobScanner(right);
    scannerA.scan(new First());
    scannerA.scan(new Second());
    scannerB.scan(new Second());
    scannerB.scan(new First());
    expect([...left.keys()].sort()).toEqual([...right.keys()].sort());
  });

  it('registers an instance atomically when its job names conflict', () => {
    class Tasks {
      @Interval(100, { name: 'conflict' })
      first() {}
      @Timeout(100, { name: 'conflict' })
      second() {}
    }
    const jobs = new Map<string, JobEntry>();
    expect(() => new JobScanner(jobs).scan(new Tasks())).toThrow(ConfigurationException);
    expect(jobs.size).toBe(0);
  });

  it('does not automatically execute disabled jobs through ScheduleTester.runAll', async () => {
    const enabled = vi.fn();
    const disabled = vi.fn();
    class Tasks {
      @Interval(100)
      enabled() {
        enabled();
      }
      @Interval(100, { disabled: true })
      disabled() {
        disabled();
      }
    }
    const instance = new Tasks();
    await ScheduleTester.runAll(instance);
    expect(enabled).toHaveBeenCalledTimes(1);
    expect(disabled).not.toHaveBeenCalled();
    await ScheduleTester.run(instance, 'disabled');
    expect(disabled).toHaveBeenCalledTimes(1);
  });

  it('rejects unsupported static methods and accessors at declaration time', () => {
    class Tasks {
      static task() {}
    }
    expect(() => Interval(100)(Tasks, 'task', Object.getOwnPropertyDescriptor(Tasks, 'task') ?? {})).toThrow(
      ConfigurationException,
    );
    const target = {
      get task() {
        return () => {};
      },
    };
    expect(() =>
      Interval(100)(target, 'task', Object.getOwnPropertyDescriptor(target, 'task') ?? {}),
    ).toThrow(ConfigurationException);
  });

  it('rejects multiple decorators of the same kind instead of overwriting metadata', () => {
    const target = { task() {} };
    Interval(100)(target, 'task', {});
    expect(() => Interval(200)(target, 'task', {})).toThrow(ConfigurationException);
  });

  it.each(['', ' ', '\0name'])('rejects invalid job names %j', (name) => {
    expect(() => Interval(100, { name })).toThrow();
  });

  it.each(['', ' ', '61 * * * *', '0 0 31 2 *'])(
    'rejects invalid or impossible cron expressions %j',
    (expression) => {
      expect(() => Cron(expression)).toThrow();
    },
  );

  it('rejects invalid timezones and invalid dates at definition time', () => {
    expect(() => Cron('* * * * *', { timezone: 'Not/AZone' })).toThrow();
    expect(() => Cron('* * * * *', { timezone: '' })).toThrow();
    expect(() => RunOnce(new Date(Number.NaN))).toThrow();
  });

  it.each([{}, { ms: '100' }, { ms: 100, disabled: 'true' }, { ms: 100, runOnInit: 1 }])(
    'rejects malformed reflected metadata %j',
    (metadata) => {
      const instance = { task() {} };
      Reflect.defineMetadata(SCHEDULE_METADATA_KEYS.INTERVAL, metadata, instance, 'task');
      const jobs = new Map<string, JobEntry>();
      expect(() => new JobScanner(jobs).scan(instance)).toThrow();
      expect(jobs.size).toBe(0);
    },
  );
});
