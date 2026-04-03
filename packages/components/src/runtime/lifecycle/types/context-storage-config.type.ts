import type { RedisContextAdapterOptions } from '../../context';
import type { SqliteContextAdapterOptions } from '../../context';

/** Storage backend configuration for the flow-context system. */
export type ContextStorageConfig =
  | 'memory'
  | 'file'
  | { type: 'file'; dir?: string }
  | ({ type: 'sqlite' } & SqliteContextAdapterOptions)
  | ({ type: 'redis' } & RedisContextAdapterOptions);
