export interface FileContextAdapterOptions {
  /** Directory in which the `contexts.json` file is stored. Defaults to `.spraxium`. */
  dir?: string;
}

export interface RedisContextAdapterOptions {
  host?: string;
  port?: number;
  password?: string;
  db?: number;
  /**
   * Namespace prefix for all keys written by this adapter.
   * Defaults to `spraxium:ctx:`.
   */
  keyPrefix?: string;
}

export interface SqliteContextAdapterOptions {
  /**
   * File path for the SQLite database.
   * Defaults to `.spraxium/contexts.db`.
   */
  path?: string;
}
