import type { SpraxiumDevConfig } from '@spraxium/core';

export const developmentConfig: SpraxiumDevConfig = {
  debounce: 500,
  entrypoint: 'src/main.ts',
  exclude: ['.spraxium/**'],
};
