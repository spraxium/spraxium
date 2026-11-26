import { defineConfig } from 'vitest/config';

export default defineConfig({
  oxc: { decorator: { legacy: true } },
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.test.ts'],
  },
});
