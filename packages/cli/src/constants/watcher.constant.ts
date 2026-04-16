export const WatcherConstant = {
  DEFAULT_EXCLUDE: [
    'node_modules',
    '**/node_modules/**',
    '.git',
    '**/.git/**',
    '.spraxium',
    '**/.spraxium/**',
  ] as Array<string>,
} as const;
