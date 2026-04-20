import { defineConfig } from '@spraxium/core';
import { httpConfig } from './config/http.config';
import { developmentConfig } from './config/development.config';

export default defineConfig((env) => ({
  debug: env.isNeutral,
  plugins: [httpConfig],
  dev: developmentConfig
}));
