export interface RedisScheduleClient {
  connect(): Promise<unknown>;
  disconnect(): unknown;
  set(key: string, value: string, mode: 'PX', ttlMs: number, condition: 'NX'): Promise<unknown>;
  eval(script: string, keyCount: number, ...args: Array<string | number>): Promise<unknown>;
}
