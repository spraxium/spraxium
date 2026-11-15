import { Injectable } from '@spraxium/common';
import { ConfigStore, ConfigurationException, ModuleLoader } from '@spraxium/core';
import { logger } from '@spraxium/logger';
import { MESSAGES } from '../constants/messages.constant';
import { MemoryDriver } from '../drivers/memory.driver';
import type { JobEntry } from '../interfaces/job-entry.interface';
import type { JobStatus } from '../interfaces/job-status.interface';
import type { ScheduleDriver } from '../interfaces/schedule-driver.interface';
import { JobMetadataReader } from '../metadata/job-metadata.reader';
import { defineSchedule } from '../schedule.config';
import { CronParser } from '../utils/cron.parser';
import { ScheduleValidator } from '../validation/schedule.validator';
import { JobExecutor } from './job.executor';
import { JobScanner } from './job.scanner';
import { JobScheduler } from './job.scheduler';

@Injectable()
export class ScheduleRegistry {
  private readonly jobs = new Map<string, JobEntry>();
  private readonly scanner = new JobScanner(this.jobs, new JobMetadataReader());
  private readonly scannerFn = this.scan.bind(this);
  private readonly executor = new JobExecutor(this.canExecute.bind(this));
  private readonly scheduler = new JobScheduler(this.jobs, this.executor);
  private driver: ScheduleDriver = new MemoryDriver();
  private bootPromise?: Promise<void>;
  private shutdownPromise?: Promise<void>;
  private booted = false;
  private online = false;
  private closing = false;
  private disabled = false;
  private driverInitialized = false;
  private scope?: ModuleLoader;

  constructor() {
    ModuleLoader.instanceScanners.add(this.scannerFn);
  }

  setDriver(driver: ScheduleDriver): void {
    if (this.bootPromise || this.closing)
      throw new ConfigurationException({ key: 'schedule.driver', reason: 'Set the driver before boot' });
    ScheduleValidator.driver(driver);
    this.driver = driver;
  }

  boot(): Promise<void> {
    if (this.closing) return Promise.resolve();
    this.bootPromise ??= this.initialize().catch(this.resetBoot.bind(this));
    return this.bootPromise;
  }

  async ready(): Promise<void> {
    if (!this.bootPromise || this.closing) return;
    await this.bootPromise;
    if (!this.booted || this.disabled || this.closing || this.online) return;
    this.online = true;
    for (const job of this.jobs.values()) if (job.type === 'after-online') this.start(job);
  }

  shutdown(): Promise<void> {
    this.closing = true;
    ModuleLoader.instanceScanners.delete(this.scannerFn);
    for (const job of this.jobs.values()) this.scheduler.cancel(job);
    this.shutdownPromise ??= this.dispose();
    return this.shutdownPromise;
  }

  pause(name: string): void {
    const job = this.jobs.get(name);
    if (!job) {
      logger.warn(MESSAGES.JOB_NOT_FOUND_PAUSE(name));
      return;
    }
    job.paused = true;
    this.scheduler.cancel(job);
    logger.debug(MESSAGES.JOB_PAUSED(name));
  }

  resume(name: string): void {
    const job = this.jobs.get(name);
    if (!job) {
      logger.warn(MESSAGES.JOB_NOT_FOUND_RESUME(name));
      return;
    }
    if (job.running || this.closing) return;
    job.paused = false;
    this.start(job, false);
    if (job.running) logger.debug(MESSAGES.JOB_RESUMED(name));
  }

  destroy(name: string): void {
    const job = this.jobs.get(name);
    if (!job) {
      logger.warn(MESSAGES.JOB_NOT_FOUND_DESTROY(name));
      return;
    }
    this.scheduler.cancel(job);
    this.jobs.delete(name);
    logger.debug(MESSAGES.JOB_DESTROYED(name));
  }

  get(name: string): JobStatus | null {
    const job = this.jobs.get(name);
    return job ? this.toStatus(job) : null;
  }

  getAll(): Array<JobStatus> {
    const statuses: Array<JobStatus> = [];
    for (const job of this.jobs.values()) statuses.push(this.toStatus(job));
    return statuses;
  }

  async runNow(name: string): Promise<void> {
    const job = this.jobs.get(name);
    if (!job) {
      logger.warn(MESSAGES.JOB_NOT_FOUND_RUN_NOW(name));
      return;
    }
    if (!this.canExecute(job) || (job.type === 'after-online' && !this.online)) return;
    await this.scheduler.runNow(job);
  }

  private canExecute(job: JobEntry): boolean {
    return this.booted && !this.closing && !this.disabled && !job.disabled && this.jobs.get(job.name) === job;
  }

  private scan(instance: unknown, scope?: ModuleLoader): void {
    if (this.closing) return;
    if (this.scope && scope && this.scope !== scope) return;
    this.scope ??= scope;
    for (const job of this.scanner.scan(instance)) {
      if (this.booted) this.start(job);
    }
  }

  private start(job: JobEntry, runOnInit = true): void {
    if (!this.canExecute(job) || job.paused || (job.type === 'after-online' && !this.online)) return;
    this.scheduler.start(job, runOnInit);
  }

  private async initialize(): Promise<void> {
    const config = ConfigStore.getPluginConfig(defineSchedule) ?? {};
    ScheduleValidator.config(config);
    this.driver = config.driver ?? this.driver;
    ScheduleValidator.driver(this.driver);
    this.disabled = config.disableAll ?? false;
    this.scheduler.configure(config.timezone);
    for (const job of this.jobs.values()) {
      if (job.type === 'cron') {
        CronParser.validate(job.expression ?? '', job.timezone ?? config.timezone);
      }
    }
    if (this.disabled) {
      logger.warn(MESSAGES.SCHEDULE_DISABLED);
      return;
    }
    try {
      await this.driver.init();
      this.driverInitialized = true;
      if (this.closing) return;
      this.booted = true;
      this.executor.start(this.driver, config.defaultLockTtlMs ?? 60_000);
      for (const job of this.jobs.values()) this.start(job);
    } catch (error) {
      this.booted = false;
      for (const job of this.jobs.values()) this.scheduler.cancel(job);
      await this.executor.stop();
      try {
        await this.driver.destroy();
      } catch (cleanupError) {
        logger.error(String(cleanupError));
      }
      this.driverInitialized = false;
      throw error;
    }
  }

  private async dispose(): Promise<void> {
    try {
      if (this.bootPromise) await this.bootPromise.catch(this.ignoreBootFailure.bind(this));
      await this.executor.stop();
      if (this.driverInitialized) await this.driver.destroy();
    } finally {
      this.driverInitialized = false;
      this.booted = false;
      this.jobs.clear();
    }
  }

  private ignoreBootFailure(): void {}

  private resetBoot(error: unknown): never {
    this.bootPromise = undefined;
    throw error;
  }

  private toStatus(job: JobEntry): JobStatus {
    return {
      name: job.name,
      type: job.type,
      expression: job.expression,
      intervalMs: job.intervalMs,
      running: job.running,
      executing: job.executing ?? false,
      runCount: job.runCount,
      lastRun: job.lastRun ? new Date(job.lastRun) : undefined,
      nextRun: job.nextRun ? new Date(job.nextRun) : undefined,
      description: job.description,
    };
  }
}
