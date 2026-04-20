import { defineConfig } from '@spraxium/core';
import { scheduleConfig } from './config/schedule.config';

export default defineConfig((env) => ({
  debug: env.isNeutral,
  plugins: [scheduleConfig],
}));
