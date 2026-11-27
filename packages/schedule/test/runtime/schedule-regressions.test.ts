import 'reflect-metadata';
import { ConfigStore, ModuleLoader } from '@spraxium/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SCHEDULE_METADATA_KEYS } from '../../src/constants/metadata-keys.constant';
import { AfterOnline } from '../../src/decorators/after-online.decorator';
import { Interval } from '../../src/decorators/interval.decorator';
import { RunOnce } from '../../src/decorators/run-once.decorator';
import { Timeout } from '../../src/decorators/timeout.decorator';
import type { ScheduleDriver } from '../../src/interfaces/schedule-driver.interface';
import { ScheduleRegistry } from '../../src/runtime/schedule.registry';

vi.mock('@spraxium/core', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@spraxium/core')>()),
  ConfigStore: { getPluginConfig: vi.fn() },
}));

describe('Schedule lifecycle regressions', () => {
  let registry: ScheduleRegistry;

  function register(key: string, metadata: object, fn = vi.fn(), scope?: ModuleLoader) {
    const prototype = { task: fn };
    Reflect.defineMetadata(key, metadata, prototype, 'task');
    const instance: object = Object.create(prototype);
    for (const scanner of ModuleLoader.instanceScanners) scanner(instance, scope);
    return fn;
  }

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    vi.mocked(ConfigStore.getPluginConfig).mockReturnValue(undefined);
    ModuleLoader.instanceScanners.clear();
    registry = new ScheduleRegistry();
  });

  afterEach(async () => {
    await registry.shutdown();
    vi.useRealTimers();
  });

  it('does not arm AfterOnline during boot', async () => {
    register(SCHEDULE_METADATA_KEYS.AFTER_ONLINE, { ms: 10, name: 'online' });
    await registry.boot();
    expect(registry.get('online')?.running).toBe(false);
    expect(registry.get('online')?.nextRun).toBeUndefined();
  });

  it('keeps a job paused before ready from being started by ready', async () => {
    const fn = register(SCHEDULE_METADATA_KEYS.AFTER_ONLINE, { ms: 10, name: 'online' });
    await registry.boot();
    registry.pause('online');
    await registry.ready();
    await vi.advanceTimersByTimeAsync(100);
    expect(fn).not.toHaveBeenCalled();
  });

  it('applies disableAll to ready and manual execution too', async () => {
    vi.mocked(ConfigStore.getPluginConfig).mockReturnValue({ disableAll: true });
    const fn = register(SCHEDULE_METADATA_KEYS.AFTER_ONLINE, { ms: 0, name: 'online' });
    await registry.boot();
    await registry.ready();
    await registry.runNow('online');
    await vi.advanceTimersByTimeAsync(10);
    expect(fn).not.toHaveBeenCalled();
  });

  it('does not start additional timers on repeated boot', async () => {
    const fn = register(SCHEDULE_METADATA_KEYS.INTERVAL, { ms: 100, name: 'repeat' });
    await registry.boot();
    await registry.boot();
    await vi.advanceTimersByTimeAsync(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('skips overlapping interval executions with the default driver', async () => {
    let finish: () => void = () => {};
    const pending = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const fn = register(
      SCHEDULE_METADATA_KEYS.INTERVAL,
      { ms: 10, name: 'slow' },
      vi.fn(() => pending),
    );
    await registry.boot();
    await vi.advanceTimersByTimeAsync(50);
    finish();
    await pending;
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('does not execute a RunOnce date that was already in the past at boot', async () => {
    const fn = register(SCHEDULE_METADATA_KEYS.RUN_ONCE, { date: new Date('2025-01-01Z'), name: 'past' });
    await registry.boot();
    await vi.advanceTimersByTimeAsync(10);
    expect(fn).not.toHaveBeenCalled();
  });

  it('does not clamp a distant RunOnce date to one millisecond', async () => {
    const fn = register(SCHEDULE_METADATA_KEYS.RUN_ONCE, { date: new Date('2027-01-01Z'), name: 'future' });
    await registry.boot();
    await vi.advanceTimersByTimeAsync(10);
    expect(fn).not.toHaveBeenCalled();
  });

  it('returns defensive status dates', async () => {
    register(SCHEDULE_METADATA_KEYS.CRON, { expression: '* * * * *', name: 'cron' });
    await registry.boot();
    registry.get('cron')?.nextRun?.setFullYear(2000);
    expect(registry.get('cron')?.nextRun?.getUTCFullYear()).toBe(2026);
  });

  it('contains driver acquisition failures when runNow is invoked', async () => {
    const driver: ScheduleDriver = {
      init: vi.fn().mockResolvedValue(undefined),
      destroy: vi.fn().mockResolvedValue(undefined),
      acquireLock: vi.fn().mockRejectedValue(new Error('Redis unavailable')),
      releaseLock: vi.fn().mockResolvedValue(undefined),
    };
    registry.setDriver(driver);
    register(SCHEDULE_METADATA_KEYS.INTERVAL, { ms: 1000, name: 'redis' });
    await registry.boot();
    await expect(registry.runNow('redis')).resolves.toBeUndefined();
  });

  it('does not execute a disabled job manually', async () => {
    const fn = register(SCHEDULE_METADATA_KEYS.INTERVAL, { ms: 100, name: 'disabled', disabled: true });
    await registry.boot();
    await registry.runNow('disabled');
    expect(fn).not.toHaveBeenCalled();
  });

  it('starts AfterOnline once, counting its delay from ready', async () => {
    const fn = register(SCHEDULE_METADATA_KEYS.AFTER_ONLINE, { ms: 50, name: 'online' });
    await registry.boot();
    await vi.advanceTimersByTimeAsync(100);
    await registry.ready();
    await registry.ready();
    await vi.advanceTimersByTimeAsync(49);
    expect(fn).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(registry.get('online')).toBeNull();
  });

  it('does not execute jobs manually before boot or before ready', async () => {
    const fn = register(SCHEDULE_METADATA_KEYS.AFTER_ONLINE, { ms: 10, name: 'online' });
    await registry.runNow('online');
    await registry.boot();
    await registry.runNow('online');
    expect(fn).not.toHaveBeenCalled();
  });

  it('runs a timeout manually once and cancels its automatic timer', async () => {
    const fn = register(SCHEDULE_METADATA_KEYS.TIMEOUT, { ms: 10, name: 'once' });
    await registry.boot();
    await registry.runNow('once');
    await vi.advanceTimersByTimeAsync(100);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(registry.get('once')).toBeNull();
  });

  it('runs runOnInit once and does not repeat it when resuming', async () => {
    const fn = register(SCHEDULE_METADATA_KEYS.INTERVAL, { ms: 100, name: 'init', runOnInit: true });
    await registry.boot();
    await vi.advanceTimersByTimeAsync(0);
    registry.pause('init');
    registry.resume('init');
    await vi.advanceTimersByTimeAsync(0);
    expect(fn).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(100);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('refreshes cron nextRun before executing the handler', async () => {
    register(SCHEDULE_METADATA_KEYS.CRON, { expression: '* * * * * *', name: 'cron' });
    await registry.boot();
    await vi.advanceTimersByTimeAsync(1000);
    expect(registry.get('cron')?.lastRun?.toISOString()).toBe('2026-01-01T00:00:01.000Z');
    expect(registry.get('cron')?.nextRun?.toISOString()).toBe('2026-01-01T00:00:02.000Z');
  });

  it.each(['pause', 'destroy'] as const)(
    'does not resurrect cron after a handler calls %s',
    async (operation) => {
      const fn = register(
        SCHEDULE_METADATA_KEYS.CRON,
        { expression: '* * * * * *', name: 'cron' },
        vi.fn(() => registry[operation]('cron')),
      );
      await registry.boot();
      await vi.advanceTimersByTimeAsync(5000);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(registry.get('cron')?.running ?? false).toBe(false);
    },
  );

  it('splits delays greater than the Node timer limit without executing early', async () => {
    const delay = 2_147_483_647 + 100;
    const fn = register(SCHEDULE_METADATA_KEYS.TIMEOUT, { ms: delay, name: 'long' });
    await registry.boot();
    await vi.advanceTimersByTimeAsync(2_147_483_647);
    expect(fn).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(99);
    expect(fn).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('does not fire early if the wall clock moves backwards', async () => {
    const fn = register(SCHEDULE_METADATA_KEYS.TIMEOUT, { ms: 100, name: 'clock' });
    await registry.boot();
    vi.setSystemTime(new Date('2025-12-31T23:59:59Z'));
    await vi.advanceTimersByTimeAsync(100);
    expect(fn).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1000);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('uses global timezone and lets per-job timezone override it', async () => {
    vi.mocked(ConfigStore.getPluginConfig).mockReturnValue({ timezone: 'America/Sao_Paulo' });
    register(SCHEDULE_METADATA_KEYS.CRON, { expression: '0 0 * * *', name: 'global' });
    register(SCHEDULE_METADATA_KEYS.CRON, { expression: '0 0 * * *', name: 'utc', timezone: 'UTC' });
    await registry.boot();
    expect(registry.get('global')?.nextRun?.toISOString()).toBe('2026-01-01T03:00:00.000Z');
    expect(registry.get('utc')?.nextRun?.toISOString()).toBe('2026-01-02T00:00:00.000Z');
  });

  it('starts jobs discovered after boot and AfterOnline discovered after ready', async () => {
    await registry.boot();
    await registry.ready();
    const interval = register(SCHEDULE_METADATA_KEYS.INTERVAL, { ms: 10, name: 'late' });
    const online = register(SCHEDULE_METADATA_KEYS.AFTER_ONLINE, { ms: 10, name: 'late-online' });
    await vi.advanceTimersByTimeAsync(10);
    expect(interval).toHaveBeenCalledTimes(1);
    expect(online).toHaveBeenCalledTimes(1);
  });

  it('does not call a handler if it was destroyed while acquiring its lock', async () => {
    let acquired: (value: boolean) => void = () => {};
    const lock = new Promise<boolean>((resolve) => {
      acquired = resolve;
    });
    const releaseLock = vi.fn().mockResolvedValue(undefined);
    registry.setDriver({
      init: async () => {},
      destroy: async () => {},
      acquireLock: () => lock,
      releaseLock,
    });
    const fn = register(SCHEDULE_METADATA_KEYS.INTERVAL, { ms: 100, name: 'acquiring' });
    await registry.boot();
    const execution = registry.runNow('acquiring');
    registry.destroy('acquiring');
    acquired(true);
    await execution;
    expect(fn).not.toHaveBeenCalled();
    expect(releaseLock).toHaveBeenCalledWith('acquiring');
  });

  it('invalidates automatic execution paused while acquiring a lock', async () => {
    let acquired: (value: boolean) => void = () => {};
    const lock = new Promise<boolean>((resolve) => {
      acquired = resolve;
    });
    registry.setDriver({
      init: async () => {},
      destroy: async () => {},
      acquireLock: () => lock,
      releaseLock: async () => {},
    });
    const fn = register(SCHEDULE_METADATA_KEYS.INTERVAL, { ms: 10, name: 'acquiring' });
    await registry.boot();
    await vi.advanceTimersByTimeAsync(10);
    registry.pause('acquiring');
    acquired(true);
    await vi.advanceTimersByTimeAsync(0);
    expect(fn).not.toHaveBeenCalled();
  });

  it('applies the configured TTL and drains running jobs before destroying the driver', async () => {
    const events: Array<string> = [];
    let finish: () => void = () => {};
    const pending = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const acquireLock = vi.fn().mockResolvedValue(true);
    registry.setDriver({
      init: async () => {},
      acquireLock,
      releaseLock: async () => {
        events.push('released');
      },
      destroy: async () => {
        events.push('destroyed');
      },
    });
    vi.mocked(ConfigStore.getPluginConfig).mockReturnValue({ defaultLockTtlMs: 900 });
    register(
      SCHEDULE_METADATA_KEYS.INTERVAL,
      { ms: 10, name: 'drain' },
      vi.fn(() => pending),
    );
    await registry.boot();
    await vi.advanceTimersByTimeAsync(10);
    expect(registry.get('drain')?.executing).toBe(true);
    const shutdown = registry.shutdown();
    expect(events).toEqual([]);
    finish();
    await shutdown;
    expect(events).toEqual(['released', 'destroyed']);
    expect(acquireLock).toHaveBeenCalledWith('drain', 900);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('renews slow distributed jobs and stops renewal after releasing the lock', async () => {
    const renewLock = vi.fn().mockResolvedValue(true);
    registry.setDriver({
      init: async () => {},
      destroy: async () => {},
      acquireLock: async () => true,
      releaseLock: async () => {},
      renewLock,
    });
    vi.mocked(ConfigStore.getPluginConfig).mockReturnValue({ defaultLockTtlMs: 90 });
    register(
      SCHEDULE_METADATA_KEYS.TIMEOUT,
      { ms: 0, name: 'lease' },
      vi.fn(() => new Promise<void>((resolve) => setTimeout(resolve, 200))),
    );
    await registry.boot();
    await vi.advanceTimersByTimeAsync(201);
    expect(renewLock).toHaveBeenCalledTimes(6);
    expect(renewLock).toHaveBeenCalledWith('lease', 90);
    await vi.advanceTimersByTimeAsync(500);
    expect(renewLock).toHaveBeenCalledTimes(6);
  });

  it('contains renewal and release failures and keeps later jobs working', async () => {
    const releaseLock = vi.fn().mockRejectedValue(new Error('release failed'));
    const renewLock = vi.fn().mockRejectedValue(new Error('renewal failed'));
    registry.setDriver({
      init: async () => {},
      destroy: async () => {},
      acquireLock: async () => true,
      releaseLock,
      renewLock,
    });
    vi.mocked(ConfigStore.getPluginConfig).mockReturnValue({ defaultLockTtlMs: 30 });
    const fn = register(
      SCHEDULE_METADATA_KEYS.INTERVAL,
      { ms: 100, name: 'errors' },
      vi.fn(() => new Promise<void>((resolve) => setTimeout(resolve, 30))),
    );
    await registry.boot();
    await vi.advanceTimersByTimeAsync(240);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(renewLock).toHaveBeenCalledTimes(2);
    expect(releaseLock).toHaveBeenCalledTimes(2);
  });

  it('cleans up a failed initialization, permits retry and forbids swapping a booted driver', async () => {
    const destroy = vi.fn().mockResolvedValue(undefined);
    const driver: ScheduleDriver = {
      init: vi.fn().mockRejectedValueOnce(new Error('connect failed')).mockResolvedValue(undefined),
      destroy,
      acquireLock: async () => true,
      releaseLock: async () => {},
    };
    registry.setDriver(driver);
    await expect(registry.boot()).rejects.toThrow('connect failed');
    expect(destroy).toHaveBeenCalledTimes(1);
    await registry.boot();
    expect(() => registry.setDriver(driver)).toThrow();
    await registry.shutdown();
    expect(destroy).toHaveBeenCalledTimes(2);
  });

  it('handles shutdown racing with initialization without starting jobs', async () => {
    let finish: () => void = () => {};
    const pending = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const destroy = vi.fn().mockResolvedValue(undefined);
    registry.setDriver({
      init: () => pending,
      destroy,
      acquireLock: async () => true,
      releaseLock: async () => {},
    });
    const fn = register(SCHEDULE_METADATA_KEYS.INTERVAL, { ms: 10, name: 'race', runOnInit: true });
    const boot = registry.boot();
    const shutdown = registry.shutdown();
    finish();
    await Promise.all([boot, shutdown]);
    expect(fn).not.toHaveBeenCalled();
    expect(destroy).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
    expect(ModuleLoader.instanceScanners.size).toBe(0);
  });

  it('does not make a completed shutdown destroy the driver again', async () => {
    const destroy = vi.fn().mockResolvedValue(undefined);
    registry.setDriver({
      init: async () => {},
      destroy,
      acquireLock: async () => true,
      releaseLock: async () => {},
    });
    await registry.boot();
    await registry.shutdown();
    await registry.shutdown();
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  it('keeps separate applications from discovering and executing each other jobs', async () => {
    const scopeA = new ModuleLoader();
    const scopeB = new ModuleLoader();
    const fnA = register(SCHEDULE_METADATA_KEYS.INTERVAL, { ms: 100, name: 'same-job' }, vi.fn(), scopeA);
    const registryB = new ScheduleRegistry();
    try {
      const fnB = register(SCHEDULE_METADATA_KEYS.INTERVAL, { ms: 100, name: 'same-job' }, vi.fn(), scopeB);
      await Promise.all([registry.boot(), registryB.boot()]);
      expect(registry.getAll()).toHaveLength(1);
      expect(registryB.getAll()).toHaveLength(1);
      await registry.runNow('same-job');
      expect(fnA).toHaveBeenCalledTimes(1);
      expect(fnB).not.toHaveBeenCalled();
      await registryB.runNow('same-job');
      expect(fnA).toHaveBeenCalledTimes(1);
      expect(fnB).toHaveBeenCalledTimes(1);
    } finally {
      await registryB.shutdown();
    }
  });
});

describe('Invalid schedule values', () => {
  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, 0.5])(
    'rejects invalid millisecond value %s',
    (value) => {
      expect(() => Interval(value)).toThrow();
      expect(() => Timeout(value)).toThrow();
      expect(() => AfterOnline(value)).toThrow();
    },
  );

  it('copies the RunOnce date rather than retaining the caller date', () => {
    const date = new Date('2027-01-01Z');
    const decorator = RunOnce(date);
    date.setUTCFullYear(2000);
    const target = {};
    decorator(target, 'task', {});
    const metadata: { date: Date } = Reflect.getMetadata(SCHEDULE_METADATA_KEYS.RUN_ONCE, target, 'task');
    expect(metadata.date.getUTCFullYear()).toBe(2027);
  });
});
