import { defineConfig } from '@spraxium/core';
import { signalConfig } from './config/signal.config';

export default defineConfig((env) => ({
  debug: env.isNeutral,
  plugins: [signalConfig],
}));
