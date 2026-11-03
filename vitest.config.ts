import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      'packages/core',
      'packages/logger',
      'packages/signal',
      'packages/signal-client',
      'packages/env',
      'packages/cli',
      'packages/schedule',
      'packages/components',
      'apps/sandbox',
    ],
  },
});
