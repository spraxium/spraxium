export interface ScheduleDriver {
  init(): Promise<void>;
  acquireLock(jobName: string, ttlMs: number): Promise<boolean>;
  releaseLock(jobName: string): Promise<void>;
  renewLock?(jobName: string, ttlMs: number): Promise<boolean>;
  destroy(): Promise<void>;
}
