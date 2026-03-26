/**
 * Default path patterns excluded from the dev watcher regardless of user config.
 * Each entry has both a bare name (matches the directory emitted directly by fs.watch
 * on Windows) and a glob variant (matches nested paths).
 */
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
