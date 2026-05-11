import { ContextStore, FileContextAdapter, RedisContextAdapter, SqliteContextAdapter } from '../context';
import type { ContextStorageConfig } from './types';

export async function initContextAdapter(
  cfg: ContextStorageConfig | undefined,
  defaultTtl?: number,
): Promise<void> {
  if (defaultTtl != null) ContextStore.defaultTtl = defaultTtl;

  if (cfg === undefined || cfg === null) return;

  let adapter: FileContextAdapter | SqliteContextAdapter | RedisContextAdapter;

  const VALID_TYPES = ['file', 'sqlite', 'redis'];

  if (typeof cfg !== 'object' || !VALID_TYPES.includes((cfg as { type?: string }).type ?? '')) {
    const received =
      typeof cfg === 'object' ? `{ type: '${(cfg as { type?: string }).type}' }` : JSON.stringify(cfg);
    throw new Error(
      `[Spraxium] Invalid context.storage value: ${received}. Use { type: 'file' } for single-instance bots, { type: 'sqlite' } for higher write volume, or { type: 'redis' } for multi-process deployments.`,
    );
  }
  if (cfg.type === 'file') {
    adapter = new FileContextAdapter({ dir: cfg.dir });
  } else if (cfg.type === 'sqlite') {
    adapter = new SqliteContextAdapter({ path: cfg.path });
  } else {
    adapter = new RedisContextAdapter(cfg);
  }

  await ContextStore.initialize(adapter);
}
