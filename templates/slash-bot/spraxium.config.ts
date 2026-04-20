import { defineConfig } from '@spraxium/core';
import { developmentConfig } from './config/development.config';

export default defineConfig((env) => ({
  debug: env.isNeutral,
  plugins: [],
  dev: developmentConfig,
}));
