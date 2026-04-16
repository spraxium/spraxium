import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/swc.loader.ts'],
  format: ['esm'],
  dts: false,
  clean: true,
  platform: 'node',
});
