import 'reflect-metadata';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { JobEntry } from '../../src/interfaces/job-entry.interface';
import type { ScheduleDriver } from '../../src/interfaces/schedule-driver.interface';
import { ScheduleRegistry } from '../../src/runtime/schedule.registry';

function addJob(registry: ScheduleRegistry, fn: () => Promise<void>): JobEntry {
  const job: JobEntry = {
    name: 'job',
    type: 'interval',
    intervalMs: 60_000,
    fn,
    running: false,
    disabled: false,
    runOnInit: false,
    runCount: 0,
  };
  (registry as unknown as { jobs: Map<string, JobEntry> }).jobs.set(job.name, job);
  return job;
}

function driver(overrides: Partial<ScheduleDriver>): ScheduleDriver {
  return {
    init: async () => {},
    acquireLock: async () => true,
    releaseLock: async () => {},
    destroy: async () => {},
    ...overrides,
  };
}

describe('ScheduleRegistry lock handling', () => {
  const registries: Array<ScheduleRegistry> = [];
  const create = (): ScheduleRegistry => {
    const registry = new ScheduleRegistry();
    registries.push(registry);
    return registry;
  };

  afterEach(async () => {
    for (const registry of registries.splice(0)) await registry.shutdown();
  });

  it('passes the acquisition token back to releaseLock', async () => {
    const registry = create();
    const releaseLock = vi.fn(async () => {});
    registry.setDriver(driver({ acquireLock: async () => 'token-1', releaseLock }));
    addJob(registry, async () => {});

    await registry.runNow('job');

    expect(releaseLock).toHaveBeenCalledWith('job', 'token-1');
  });

  it('contains acquireLock failures instead of rejecting', async () => {
    const registry = create();
    const fn = vi.fn(async () => {});
    registry.setDriver(
      driver({
        acquireLock: async () => {
          throw new Error('redis down');
        },
      }),
    );
    addJob(registry, fn);

    await expect(registry.runNow('job')).resolves.toBeUndefined();
    expect(fn).not.toHaveBeenCalled();
  });

  it('contains releaseLock failures instead of rejecting', async () => {
    const registry = create();
    const fn = vi.fn(async () => {});
    registry.setDriver(
      driver({
        releaseLock: async () => {
          throw new Error('redis down');
        },
      }),
    );
    addJob(registry, fn);

    await expect(registry.runNow('job')).resolves.toBeUndefined();
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
