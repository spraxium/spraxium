import { defineConfig } from '@spraxium/core';
import { componentsConfig } from './config/components.config';
import { i18nConfig } from './config/i18n.config';

export default defineConfig((env) => ({
  debug: env.isNeutral,
  plugins: [componentsConfig, i18nConfig],
}));
