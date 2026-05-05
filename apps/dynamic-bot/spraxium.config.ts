import { defineConfig } from '@spraxium/core';
import { componentsConfig } from './config/components.config';
import { loggerConfig } from './config/logger.config';

export default defineConfig((env) => ({
  debug: env.isNeutral,
  plugins: [componentsConfig],
  logger: loggerConfig,
}));
