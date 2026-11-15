import { logger } from '@spraxium/logger';
import type { ScheduleDriver } from '../interfaces/schedule-driver.interface';

export class JobLeaseService {
  private timer?: ReturnType<typeof setInterval>;
  private renewal?: Promise<void>;
  private stopped = false;

  constructor(
    private readonly driver: ScheduleDriver,
    private readonly name: string,
    private readonly ttlMs: number,
  ) {}

  start(): void {
    if (!this.driver.renewLock) return;
    this.timer = setInterval(this.tick.bind(this), Math.max(1, Math.floor(this.ttlMs / 3)));
    this.timer.unref();
  }

  async stop(): Promise<void> {
    this.stopped = true;
    if (this.timer !== undefined) clearInterval(this.timer);
    this.timer = undefined;
    await this.renewal;
  }

  private tick(): void {
    if (this.stopped || this.renewal) return;
    this.renewal = this.renew();
    void this.renewal.finally(this.clearRenewal.bind(this));
  }

  private clearRenewal(): void {
    this.renewal = undefined;
  }

  private async renew(): Promise<void> {
    try {
      if (await this.driver.renewLock?.(this.name, this.ttlMs)) return;
      this.fail('ownership was lost');
    } catch (error) {
      this.fail(error instanceof Error ? error.message : String(error));
    }
  }

  private fail(reason: string): void {
    this.stopped = true;
    if (this.timer !== undefined) clearInterval(this.timer);
    this.timer = undefined;
    logger.error(`Schedule lock renewal failed for "${this.name}": ${reason}`);
  }
}
