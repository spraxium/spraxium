import { defineConfig } from '@spraxium/core';
import { httpConfig } from './config/http.config';

export default defineConfig((env) => ({
  debug: env.isNeutral,
  plugins: [httpConfig],
}));
