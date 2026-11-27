import { logger } from '@spraxium/logger';
import type { JobEntry } from '../interfaces/job-entry.interface';
import { CronParser } from '../utils/cron.parser';
import type { JobExecutor } from './job.executor';

export class JobScheduler {
  private readonly revisions = new WeakMap<JobEntry, number>();
  private timezone?: string;

  constructor(
    private readonly jobs: Map<string, JobEntry>,
    private readonly executor: JobExecutor,
  ) {}

  configure(timezone?: string): void {
    this.timezone = timezone;
  }

  start(job: JobEntry, runOnInit = true): void {
    this.cancel(job);
    if (job.disabled || job.paused) return;
    if (job.type === 'run-once' && (job.runAt?.getTime() ?? 0) <= Date.now()) {
      logger.warn(`@RunOnce job "${job.name}" is in the past and will not be scheduled`);
      return;
    }
    job.running = true;
    const revision = this.revision(job);
    const due =
      job.type === 'cron'
        ? CronParser.next(job.expression ?? '', job.timezone ?? this.timezone).getTime()
        : job.type === 'run-once'
          ? (job.runAt?.getTime() ?? Date.now())
          : Date.now() + (job.intervalMs ?? 0);
    this.arm(job, due, revision);
    if (runOnInit && job.runOnInit) void this.executor.execute(job, this.isCurrent.bind(this, job, revision));
  }

  cancel(job: JobEntry): void {
    this.revisions.set(job, this.revision(job) + 1);
    if (job.timeoutHandle !== undefined) clearTimeout(job.timeoutHandle);
    if (job.intervalHandle !== undefined) clearInterval(job.intervalHandle);
    job.timeoutHandle = undefined;
    job.intervalHandle = undefined;
    job.nextRun = undefined;
    job.running = false;
  }

  async runNow(job: JobEntry): Promise<void> {
    if (job.type === 'cron' || job.type === 'interval') {
      await this.executor.execute(job);
      return;
    }
    if (job.executing) return;
    const running = job.running;
    const due = job.nextRun?.getTime();
    this.cancel(job);
    const revision = this.revision(job);
    const executed = await this.executor.execute(job, this.isRegistered.bind(this, job, revision));
    if (!this.isRegistered(job, revision)) return;
    if (executed) this.jobs.delete(job.name);
    else if (running && due !== undefined && !job.paused) {
      job.running = true;
      this.arm(job, due, revision);
    }
  }

  private revision(job: JobEntry): number {
    return this.revisions.get(job) ?? 0;
  }

  private isRegistered(job: JobEntry, revision: number): boolean {
    return this.jobs.get(job.name) === job && this.revision(job) === revision;
  }

  private isCurrent(job: JobEntry, revision: number): boolean {
    return job.running && this.isRegistered(job, revision);
  }

  private arm(job: JobEntry, due: number, revision: number): void {
    if (!this.isCurrent(job, revision)) return;
    job.nextRun = new Date(due);
    job.timeoutHandle = setTimeout(
      this.fire.bind(this, job, due, revision),
      Math.min(2_147_483_647, Math.max(0, due - Date.now())),
    );
  }

  private fire(job: JobEntry, due: number, revision: number): void {
    if (!this.isCurrent(job, revision)) return;
    job.timeoutHandle = undefined;
    if (Date.now() < due) {
      this.arm(job, due, revision);
      return;
    }
    if (job.type === 'cron' || job.type === 'interval') {
      try {
        const interval = job.intervalMs ?? 1;
        const next =
          job.type === 'cron'
            ? CronParser.next(job.expression ?? '', job.timezone ?? this.timezone).getTime()
            : due + (Math.floor((Date.now() - due) / interval) + 1) * interval;
        this.arm(job, next, revision);
      } catch (error) {
        this.cancel(job);
        logger.error(
          `Cannot schedule "${job.name}": ${error instanceof Error ? error.message : String(error)}`,
        );
        return;
      }
      void this.executor.execute(job, this.isCurrent.bind(this, job, revision));
    } else void this.runOnce(job, revision);
  }

  private async runOnce(job: JobEntry, revision: number): Promise<void> {
    job.nextRun = undefined;
    await this.executor.execute(job, this.isCurrent.bind(this, job, revision));
    if (this.isCurrent(job, revision)) {
      this.cancel(job);
      this.jobs.delete(job.name);
    }
  }
}
