import type { ScheduleDriver } from '../interfaces/schedule-driver.interface';
import { ScheduleValidator } from '../validation/schedule.validator';

export class MemoryDriver implements ScheduleDriver {
  private readonly locks = new Set<string>();
  private initialized = false;

  async init(): Promise<void> {
    this.initialized = true;
  }

  async acquireLock(jobName: string, ttlMs: number): Promise<boolean> {
    ScheduleValidator.milliseconds(ttlMs, 1, 'schedule.lockTtlMs');
    if (!this.initialized || this.locks.has(jobName)) return false;
    this.locks.add(jobName);
    return true;
  }

  async releaseLock(jobName: string): Promise<void> {
    this.locks.delete(jobName);
  }

  async destroy(): Promise<void> {
    this.initialized = false;
    this.locks.clear();
  }
}
