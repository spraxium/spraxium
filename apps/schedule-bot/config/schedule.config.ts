import { defineSchedule } from '@spraxium/schedule';

export const scheduleConfig = defineSchedule({
  timezone: 'UTC',
  defaultLockTtlMs: 30_000,
  disableAll: false,
});
