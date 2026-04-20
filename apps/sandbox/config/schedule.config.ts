import { RedisScheduleDriver, defineSchedule } from '@spraxium/schedule';

export const scheduleConfig = defineSchedule({
  timezone: 'America/Sao_Paulo',
  defaultLockTtlMs: 60_000,
  disableAll: false,
});
