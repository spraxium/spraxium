import { defineConfig } from '@spraxium/core';
import { developmentConfig } from './config/development.config';

export default defineConfig(() => ({
  plugins: [],
  dev: developmentConfig,
}));
