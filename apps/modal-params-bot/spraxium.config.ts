import { defineConfig } from '@spraxium/core';

export default defineConfig((env) => ({
  debug: env.isNeutral,
}));
