import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/swc.loader.ts', 'src/swc.hooks.ts'],
  format: ['esm'],
  outExtensions: () => ({ js: '.js' }),
  dts: false,
  clean: true,
  platform: 'node',
});
