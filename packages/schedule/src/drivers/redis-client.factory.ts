import { ConfigurationException } from '@spraxium/core';
import type { RedisScheduleClient } from '../interfaces/redis-schedule-client.interface';
import type { RedisScheduleDriverOptions } from '../interfaces/redis-schedule-driver-options.interface';
import { ScheduleValidator } from '../validation/schedule.validator';

export class RedisClientFactory {
  async create(options: RedisScheduleDriverOptions): Promise<RedisScheduleClient> {
    this.validate(options);
    const module = await this.loadModule();
    const redisConstructor = module.default;
    if (typeof redisConstructor !== 'function')
      throw new Error('ioredis does not export a Redis constructor');
    const client: unknown = Reflect.construct(redisConstructor, [
      {
        host: options.host ?? '127.0.0.1',
        port: options.port ?? 6379,
        username: options.username,
        password: options.password,
        db: options.db ?? 0,
        tls: options.tls ? {} : undefined,
        family: options.family ?? 4,
        connectTimeout: options.connectTimeout ?? 10_000,
        maxRetriesPerRequest: options.maxRetriesPerRequest === undefined ? 1 : options.maxRetriesPerRequest,
        enableOfflineQueue: false,
        lazyConnect: true,
      },
    ]);
    if (!this.isClient(client)) throw new Error('Invalid ioredis client');
    return client;
  }

  private isClient(value: unknown): value is RedisScheduleClient {
    return (
      typeof value === 'object' &&
      value !== null &&
      'connect' in value &&
      typeof value.connect === 'function' &&
      'disconnect' in value &&
      typeof value.disconnect === 'function' &&
      'set' in value &&
      typeof value.set === 'function' &&
      'eval' in value &&
      typeof value.eval === 'function'
    );
  }

  private async loadModule(): Promise<Record<string, unknown>> {
    try {
      const packageName = 'ioredis';
      return await import(packageName);
    } catch (error) {
      throw new ConfigurationException({
        key: 'schedule.redis',
        reason: `Cannot load optional peer ioredis. Install ioredis >=5 to use RedisScheduleDriver. ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }

  private validate(options: RedisScheduleDriverOptions): void {
    if (options.host !== undefined && (typeof options.host !== 'string' || !options.host.trim()))
      this.fail('host');
    if (
      options.port !== undefined &&
      (!Number.isInteger(options.port) || options.port < 1 || options.port > 65535)
    )
      this.fail('port');
    if (options.db !== undefined && (!Number.isSafeInteger(options.db) || options.db < 0)) this.fail('db');
    if (options.family !== undefined && options.family !== 4 && options.family !== 6) this.fail('family');
    if (options.tls !== undefined && typeof options.tls !== 'boolean') this.fail('tls');
    if (options.username !== undefined && typeof options.username !== 'string') this.fail('username');
    if (options.password !== undefined && typeof options.password !== 'string') this.fail('password');
    if (options.connectTimeout !== undefined) {
      ScheduleValidator.milliseconds(options.connectTimeout, 1, 'schedule.redis.connectTimeout');
      if (options.connectTimeout > 2_147_483_647) this.fail('connectTimeout');
    }
    if (
      options.maxRetriesPerRequest !== undefined &&
      options.maxRetriesPerRequest !== null &&
      (!Number.isSafeInteger(options.maxRetriesPerRequest) || options.maxRetriesPerRequest < 0)
    )
      this.fail('maxRetriesPerRequest');
  }

  private fail(option: string): never {
    throw new ConfigurationException({
      key: `schedule.redis.${option}`,
      reason: `Invalid Redis option: ${option}`,
    });
  }
}
