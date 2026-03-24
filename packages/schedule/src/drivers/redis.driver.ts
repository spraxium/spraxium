import { randomUUID } from 'node:crypto';
import type { RedisScheduleDriverOptions } from '../interfaces/redis-schedule-driver-options.interface';
import type { ScheduleDriver } from '../interfaces/schedule-driver.interface';

const RELEASE_LOCK_SCRIPT =
  "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end";

export class RedisScheduleDriver implements ScheduleDriver {
  private client: unknown = null;
  private readonly options: RedisScheduleDriverOptions;
  private readonly keyPrefix: string;
  private readonly instanceId: string = randomUUID();

  constructor(options: RedisScheduleDriverOptions = {}) {
    this.options = options;
    this.keyPrefix = options.keyPrefix ?? 'spraxium:schedule:';
  }

  async init(): Promise<void> {
    const ioredis = (await import('ioredis' as string)) as Record<string, unknown>;
    const Redis = (ioredis.default ?? ioredis) as new (
      opts: unknown,
    ) => Record<string, (...args: Array<unknown>) => Promise<unknown>>;

    this.client = new Redis({
      host: this.options.host ?? '127.0.0.1',
      port: this.options.port ?? 6379,
      username: this.options.username,
      password: this.options.password,
      db: this.options.db ?? 0,
      tls: this.options.tls ? {} : undefined,
      connectTimeout: this.options.connectTimeout ?? 10_000,
      maxRetriesPerRequest: this.options.maxRetriesPerRequest ?? null,
      family: this.options.family ?? 4,
      lazyConnect: true,
    });

    await (this.client as Record<string, (...args: Array<unknown>) => Promise<unknown>>).connect();
  }

  async acquireLock(jobName: string, ttlMs: number): Promise<boolean> {
    if (!this.client) return false;
    const key = `${this.keyPrefix}lock:${jobName}`;
    const ttlSeconds = Math.max(1, Math.ceil(ttlMs / 1000));
    const redis = this.client as Record<string, (...args: Array<unknown>) => Promise<unknown>>;
    const result = await redis.set(key, this.instanceId, 'EX', ttlSeconds, 'NX');
    return result === 'OK';
  }

  async releaseLock(jobName: string): Promise<void> {
    if (!this.client) return;
    const key = `${this.keyPrefix}lock:${jobName}`;
    const redis = this.client as Record<string, (...args: Array<unknown>) => Promise<unknown>>;
    await redis.eval(RELEASE_LOCK_SCRIPT, 1, key, this.instanceId);
  }

  async destroy(): Promise<void> {
    if (this.client) {
      const redis = this.client as Record<string, (...args: Array<unknown>) => unknown>;
      redis.disconnect();
      this.client = null;
    }
  }
}
