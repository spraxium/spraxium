import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { JobStatus } from '../../src/interfaces/job-status.interface';
import { ScheduleService } from '../../src/runtime/schedule.service';

vi.mock('@spraxium/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@spraxium/core')>();
  return {
    ...actual,
    Logger: vi.fn().mockImplementation(() => ({
      debug: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
      error: vi.fn(),
    })),
    ModuleLoader: { instanceScanners: new Set() },
    ConfigStore: { getPluginConfig: vi.fn() },
  };
});

function makeRegistry() {
  return {
    pause: vi.fn(),
    resume: vi.fn(),
    destroy: vi.fn(),
    get: vi.fn(),
    getAll: vi.fn(),
    runNow: vi.fn(),
    boot: vi.fn(),
    ready: vi.fn(),
    shutdown: vi.fn(),
    setDriver: vi.fn(),
  };
}

describe('ScheduleService', () => {
  let registry: ReturnType<typeof makeRegistry>;
  let service: ScheduleService;

  beforeEach(() => {
    registry = makeRegistry();
    service = new ScheduleService(registry as never);
  });

  it('delegates pause() to the registry', () => {
    service.pause('job-a');
    expect(registry.pause).toHaveBeenCalledWith('job-a');
  });

  it('delegates resume() to the registry', () => {
    service.resume('job-a');
    expect(registry.resume).toHaveBeenCalledWith('job-a');
  });

  it('delegates destroy() to the registry', () => {
    service.destroy('job-a');
    expect(registry.destroy).toHaveBeenCalledWith('job-a');
  });

  it('delegates get() and returns the result', () => {
    const status: JobStatus = {
      name: 'job-a',
      type: 'interval',
      running: true,
      runCount: 1,
    };
    registry.get.mockReturnValue(status);

    const result = service.get('job-a');
    expect(registry.get).toHaveBeenCalledWith('job-a');
    expect(result).toBe(status);
  });

  it('returns null from get() when job is not found', () => {
    registry.get.mockReturnValue(null);
    expect(service.get('unknown')).toBeNull();
  });

  it('delegates getAll() and returns the result', () => {
    const statuses: Array<JobStatus> = [
      { name: 'job-a', type: 'cron', running: true, runCount: 0 },
      { name: 'job-b', type: 'timeout', running: false, runCount: 1 },
    ];
    registry.getAll.mockReturnValue(statuses);

    const result = service.getAll();
    expect(result).toBe(statuses);
  });

  it('delegates runNow() and awaits the result', async () => {
    registry.runNow.mockResolvedValue(undefined);
    await service.runNow('job-a');
    expect(registry.runNow).toHaveBeenCalledWith('job-a');
  });
});
