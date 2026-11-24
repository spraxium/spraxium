export interface RedisNonceStoreOptions {
  readonly type: 'redis';
  readonly host?: string;
  readonly port?: number;
  readonly username?: string;
  readonly password?: string;
  readonly db?: number;
  readonly tls?: boolean;
  readonly keyPrefix?: string;
}
