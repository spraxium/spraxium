import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      'packages/logger',
      'packages/signal',
      'packages/signal-client',
      'packages/env',
      'packages/cli',
      'packages/schedule',
      'apps/sandbox',
    ],
  },
});
