import { Injectable } from '@spraxium/common';
import { ConfigStore, Logger, ModuleLoader } from '@spraxium/core';
import { MESSAGES } from './constants/messages.constant';
import { MemoryDriver } from './drivers/memory.driver';
import type { JobEntry } from './interfaces/job-entry.interface';
import type { JobStatus } from './interfaces/job-status.interface';
import type { ScheduleDriver } from './interfaces/schedule-driver.interface';
import { JobScanner } from './job.scanner';
import { defineSchedule } from './schedule.config';
import { getNextRunDate } from './utils/cron.parser';

@Injectable()
export class ScheduleRegistry {
  private readonly log = new Logger('ScheduleRegistry');
  private readonly jobs = new Map<string, JobEntry>();
  private readonly pendingAfterBoot: Array<JobEntry> = [];
  private readonly scanner: JobScanner;
  private readonly scannerFn: (instance: unknown) => void;
  private driver: ScheduleDriver = new MemoryDriver();
  private lockTtlMs = 60_000;
  private driverInitialized = false;

  constructor() {
    this.scanner = new JobScanner(this.jobs, this.pendingAfterBoot);
    this.scannerFn = this.scanner.scan.bind(this.scanner);
    ModuleLoader.instanceScanners.add(this.scannerFn);
  }

  setDriver(driver: ScheduleDriver): void {
    this.driver = driver;
  }

  async boot(): Promise<void> {
    const config = ConfigStore.getPluginConfig(defineSchedule);
    if (config?.driver) this.driver = config.driver;
    if (config?.defaultLockTtlMs) this.lockTtlMs = config.defaultLockTtlMs;

    if (config?.disableAll) {
      this.log.warn(MESSAGES.SCHEDULE_DISABLED);
      return;
    }

    await this.driver.init();
    this.driverInitialized = true;

    if (config?.timezone) {
      for (const job of this.jobs.values()) {
        if (job.type === 'cron' && !job.timezone) job.timezone = config.timezone;
      }
    }

    for (const job of this.jobs.values()) {
      if (!job.disabled) this.startJob(job);
    }
  }

  async ready(): Promise<void> {
    for (const job of this.pendingAfterBoot) {
      if (!job.disabled) this.startAfterBootJob(job);
    }
  }

  async shutdown(): Promise<void> {
    ModuleLoader.instanceScanners.delete(this.scannerFn);

    for (const job of this.jobs.values()) {
      this.clearJobTimers(job);
    }

    this.jobs.clear();
    this.pendingAfterBoot.length = 0;
    if (this.driverInitialized) await this.driver.destroy();
  }

  pause(name: string): void {
    const job = this.jobs.get(name);
    if (!job) {
      this.log.warn(MESSAGES.JOB_NOT_FOUND_PAUSE(name));
      return;
    }
    if (!job.running) return;
    this.clearJobTimers(job);
    job.running = false;
    this.log.info(MESSAGES.JOB_PAUSED(name));
  }

  resume(name: string): void {
    const job = this.jobs.get(name);
    if (!job) {
      this.log.warn(MESSAGES.JOB_NOT_FOUND_RESUME(name));
      return;
    }
    if (job.running || job.disabled) return;
    this.startJob(job);
    this.log.info(MESSAGES.JOB_RESUMED(name));
  }

  destroy(name: string): void {
    const job = this.jobs.get(name);
    if (!job) {
      this.log.warn(MESSAGES.JOB_NOT_FOUND_DESTROY(name));
      return;
    }
    this.clearJobTimers(job);
    this.jobs.delete(name);

    const idx = this.pendingAfterBoot.indexOf(job);
    if (idx !== -1) this.pendingAfterBoot.splice(idx, 1);

    this.log.info(MESSAGES.JOB_DESTROYED(name));
  }

  get(name: string): JobStatus | null {
    const job = this.jobs.get(name);
    return job ? this.toStatus(job) : null;
  }

  getAll(): Array<JobStatus> {
    return Array.from(this.jobs.values()).map((j) => this.toStatus(j));
  }

  async runNow(name: string): Promise<void> {
    const job = this.jobs.get(name);
    if (!job) {
      this.log.warn(MESSAGES.JOB_NOT_FOUND_RUN_NOW(name));
      return;
    }
    await this.executeJob(job);
  }

  private startJob(job: JobEntry): void {
    job.running = true;

    if (job.type === 'cron') {
      this.scheduleCronNext(job);
      if (job.runOnInit) void this.executeJob(job);
      return;
    }

    if (job.type === 'interval') {
      const ms = job.intervalMs ?? 0;
      job.intervalHandle = setInterval(() => void this.executeJob(job), ms);
      job.nextRun = new Date(Date.now() + ms);
      if (job.runOnInit) void this.executeJob(job);
      return;
    }

    if (job.type === 'timeout') {
      const ms = job.intervalMs ?? 0;
      job.timeoutHandle = setTimeout(async () => {
        await this.executeJob(job);
        this.jobs.delete(job.name);
      }, ms);
    }
  }

  private startAfterBootJob(job: JobEntry): void {
    job.running = true;
    const ms = job.intervalMs ?? 0;
    job.nextRun = new Date(Date.now() + ms);

    job.timeoutHandle = setTimeout(async () => {
      await this.executeJob(job);
      this.jobs.delete(job.name);
    }, ms);
  }

  private scheduleCronNext(job: JobEntry): void {
    const next = getNextRunDate(job.expression ?? '', job.timezone);
    const delay = Math.max(0, next.getTime() - Date.now());
    job.nextRun = next;

    job.timeoutHandle = setTimeout(async () => {
      if (!job.running) return;
      await this.executeJob(job);
      if (job.running) this.scheduleCronNext(job);
    }, delay);
  }

  private clearJobTimers(job: JobEntry): void {
    if (job.intervalHandle !== undefined) {
      clearInterval(job.intervalHandle);
      job.intervalHandle = undefined;
    }
    if (job.timeoutHandle !== undefined) {
      clearTimeout(job.timeoutHandle);
      job.timeoutHandle = undefined;
    }
  }

  private async executeJob(job: JobEntry): Promise<void> {
    const ttlMs =
      job.type === 'cron'
        ? Math.max(30_000, getNextRunDate(job.expression ?? '', job.timezone).getTime() - Date.now())
        : (job.intervalMs ?? this.lockTtlMs);
    const acquired = await this.driver.acquireLock(job.name, ttlMs);

    if (!acquired) {
      this.log.debug(MESSAGES.JOB_LOCK_SKIPPED(job.name));
      return;
    }

    job.lastRun = new Date();
    job.runCount++;

    try {
      await job.fn();
    } catch (err) {
      const detail = err instanceof Error ? (err.stack ?? err.message) : String(err);
      this.log.error(MESSAGES.JOB_ERROR(job.name, job.type, detail));
    } finally {
      await this.driver.releaseLock(job.name);
    }
  }

  private toStatus(job: JobEntry): JobStatus {
    return {
      name: job.name,
      type: job.type,
      expression: job.expression,
      intervalMs: job.intervalMs,
      running: job.running,
      lastRun: job.lastRun,
      nextRun: job.nextRun,
      runCount: job.runCount,
    };
  }
}
