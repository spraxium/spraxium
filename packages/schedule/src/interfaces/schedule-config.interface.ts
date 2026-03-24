import type { ScheduleDriver } from './schedule-driver.interface';

export interface ScheduleConfig {
  driver?: ScheduleDriver;
  timezone?: string;
  defaultLockTtlMs?: number;
  disableAll?: boolean;
}
