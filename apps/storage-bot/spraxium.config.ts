import { defineConfig } from '@spraxium/core';
import { defineStorage } from '@spraxium/storage-json';

export default defineConfig((env) => ({
  debug: env.isNeutral,
  plugins: [
    defineStorage({
      directory: process.env.STORAGE_DIRECTORY ?? '.spraxium/storage-demo',
      paths: {
        'demo-stats': process.env.STORAGE_STATS_PATH ?? '.spraxium/storage-demo/stats.json',
      },
    }),
  ],
}));
