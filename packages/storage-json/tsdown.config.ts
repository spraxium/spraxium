import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  hash: false,
  external: ['@spraxium/common', '@spraxium/core', '@spraxium/logger', 'reflect-metadata'],
});
