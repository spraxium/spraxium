import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: ['packages/signal', 'packages/signal-client', 'packages/env', 'packages/cli', 'apps/sandbox'],
  },
});
