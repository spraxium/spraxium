export interface ScheduleDriver {
  init(): Promise<void>;
  acquireLock(jobName: string, ttlMs: number): Promise<boolean>;
  releaseLock(jobName: string): Promise<void>;
  destroy(): Promise<void>;
}
