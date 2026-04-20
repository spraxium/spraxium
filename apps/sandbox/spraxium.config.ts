import { defineConfig } from '@spraxium/core';
import { componentsConfig } from './config/components.config';
import { developmentConfig } from './config/dev.config';
import { httpConfig } from './config/http.config';
import { i18nConfig } from './config/i18n.config';
import { loggerConfig } from './config/logger.config';
import { scheduleConfig } from './config/schedule.config';
import {
  ArgumentExceptionLayout,
  CommandNotFoundLayout,
} from './src/modules/prefix/layouts/prefix-exception.layouts';

export default defineConfig((env) => ({
  debug: env.isNeutral,
  plugins: [
    componentsConfig,
    scheduleConfig,
    i18nConfig,
    httpConfig,
  ],
  logger: loggerConfig,
  dev: developmentConfig,
  prefix: {
    prefix: '!',
    caseSensitive: false,
    mentionPrefix: true,
    defaultCooldown: 0,
  },
  exceptions: {
    layouts: {
      ArgumentException: ArgumentExceptionLayout,
      CommandNotFoundException: CommandNotFoundLayout,
    },
  },
}));
