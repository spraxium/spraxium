import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  hash: false,
  copy: ['entrypoints/esm/index.js', 'entrypoints/esm/index.d.ts'],
});
