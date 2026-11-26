import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  fixedExtension: false,
  dts: true,
  hash: false,
  clean: true,
  sourcemap: true,
});
