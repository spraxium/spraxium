import { logger } from '@spraxium/logger';
import { MESSAGES } from '../constants/messages.constant';
import type { JobEntry } from '../interfaces/job-entry.interface';
import type { ScheduleDriver } from '../interfaces/schedule-driver.interface';
import { JobLeaseService } from './job-lease.service';

export class JobExecutor {
  private readonly active = new Set<string>();
  private readonly pending = new Set<Promise<boolean>>();
  private accepting = false;
  private driver?: ScheduleDriver;
  private ttlMs = 60_000;

  constructor(private readonly isRegistered: (job: JobEntry) => boolean) {}

  start(driver: ScheduleDriver, ttlMs: number): void {
    this.driver = driver;
    this.ttlMs = ttlMs;
    this.accepting = true;
  }

  execute(job: JobEntry, isCurrent?: () => boolean): Promise<boolean> {
    if (!this.accepting || job.disabled || this.active.has(job.name) || !this.isRegistered(job))
      return Promise.resolve(false);
    this.active.add(job.name);
    job.executing = true;
    const task = this.run(job, isCurrent);
    this.pending.add(task);
    void task.then(this.finish.bind(this, job, task));
    return task;
  }

  async stop(): Promise<void> {
    this.accepting = false;
    await Promise.allSettled(this.pending);
  }

  private finish(job: JobEntry, task: Promise<boolean>): void {
    job.executing = false;
    this.active.delete(job.name);
    this.pending.delete(task);
  }

  private async run(job: JobEntry, isCurrent?: () => boolean): Promise<boolean> {
    const driver = this.driver;
    if (!driver) return false;
    let acquired = false;
    const lease = new JobLeaseService(driver, job.name, this.ttlMs);
    try {
      acquired = await driver.acquireLock(job.name, this.ttlMs);
      if (!acquired) {
        logger.debug(MESSAGES.JOB_LOCK_SKIPPED(job.name));
        return false;
      }
      if (!this.accepting || !this.isRegistered(job) || (isCurrent && !isCurrent())) return false;
      lease.start();
      job.lastRun = new Date();
      job.runCount++;
      try {
        await job.fn();
      } catch (error) {
        this.logError(job, error);
      }
      return true;
    } catch (error) {
      this.logError(job, error);
      return false;
    } finally {
      if (acquired) {
        await lease.stop();
        try {
          await driver.releaseLock(job.name);
        } catch (error) {
          this.logError(job, error);
        }
      }
    }
  }

  private logError(job: JobEntry, error: unknown): void {
    logger.error(
      MESSAGES.JOB_ERROR(
        job.name,
        job.type,
        error instanceof Error ? (error.stack ?? error.message) : String(error),
      ),
    );
  }
}
