import { definePlugin } from '@spraxium/core';
import type { ScheduleConfig } from './interfaces/schedule-config.interface';

export const defineSchedule = definePlugin<'schedule', ScheduleConfig>('schedule');
