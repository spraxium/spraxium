import { defineConfig } from '@spraxium/core';
import { componentsConfig } from './config/components.config';

export default defineConfig((env) => ({
  debug: env.isNeutral,
  plugins: [componentsConfig],
}));
