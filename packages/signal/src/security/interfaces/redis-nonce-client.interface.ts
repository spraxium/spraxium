export interface RedisNonceClient {
  exists(key: string): Promise<number>;
  set(key: string, value: string, expiration: 'PX', ttlMs: number, condition: 'NX'): Promise<'OK' | null>;
  disconnect(): void;
}
