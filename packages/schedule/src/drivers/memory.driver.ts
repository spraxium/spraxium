import type { ScheduleDriver } from '../interfaces/schedule-driver.interface';

export class MemoryDriver implements ScheduleDriver {
  async init(): Promise<void> {}
  async acquireLock(): Promise<boolean> {
    return true;
  }
  async releaseLock(): Promise<void> {}
  async destroy(): Promise<void> {}
}
