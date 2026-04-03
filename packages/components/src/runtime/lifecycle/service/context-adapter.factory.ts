import {
  ContextStore,
  FileContextAdapter,
  MemoryContextAdapter,
  RedisContextAdapter,
  SqliteContextAdapter,
} from '../../context';
import type { ContextStorageConfig } from '../interfaces';

export async function initContextAdapter(
  cfg: ContextStorageConfig | undefined,
  defaultTtl?: number,
): Promise<void> {
  if (defaultTtl != null) ContextStore.defaultTtl = defaultTtl;

  let adapter: MemoryContextAdapter | FileContextAdapter | SqliteContextAdapter | RedisContextAdapter;

  if (!cfg || cfg === 'memory') {
    adapter = new MemoryContextAdapter();
  } else if (cfg === 'file') {
    adapter = new FileContextAdapter();
  } else if (cfg.type === 'file') {
    adapter = new FileContextAdapter({ dir: cfg.dir });
  } else if (cfg.type === 'sqlite') {
    adapter = new SqliteContextAdapter({ path: cfg.path });
  } else {
    adapter = new RedisContextAdapter(cfg);
  }

  await ContextStore.initialize(adapter);
}
