import { defineConfig } from '@spraxium/core';
import { webhookConfig } from './config/webhook.config';

export default defineConfig((env) => ({
  debug: env.isNeutral,
  plugins: [webhookConfig],
}));
