import { Inject, Injectable } from '@spraxium/common';
import type { JobStatus } from './interfaces/job-status.interface';
import { ScheduleRegistry } from './schedule.registry';

@Injectable()
export class ScheduleService {
  constructor(@Inject(ScheduleRegistry) private readonly registry: ScheduleRegistry) {}

  pause(name: string): void {
    this.registry.pause(name);
  }

  resume(name: string): void {
    this.registry.resume(name);
  }

  destroy(name: string): void {
    this.registry.destroy(name);
  }

  get(name: string): JobStatus | null {
    return this.registry.get(name);
  }

  getAll(): Array<JobStatus> {
    return this.registry.getAll();
  }

  async runNow(name: string): Promise<void> {
    return this.registry.runNow(name);
  }
}
