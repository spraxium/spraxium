import { randomUUID } from 'node:crypto';
import { ConfigurationException } from '@spraxium/core';
import type { RedisScheduleClient } from '../interfaces/redis-schedule-client.interface';
import type { RedisScheduleDriverOptions } from '../interfaces/redis-schedule-driver-options.interface';
import type { ScheduleDriver } from '../interfaces/schedule-driver.interface';
import { ScheduleValidator } from '../validation/schedule.validator';
import { RedisClientFactory } from './redis-client.factory';

const RELEASE_LOCK_SCRIPT =
  "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end";
const RENEW_LOCK_SCRIPT =
  "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('pexpire', KEYS[1], ARGV[2]) else return 0 end";

export class RedisScheduleDriver implements ScheduleDriver {
  private readonly options: RedisScheduleDriverOptions;
  private readonly tokens = new Map<string, string>();
  private client?: RedisScheduleClient;
  private initialization?: Promise<void>;
  private initialized = false;
  private destroyed = false;

  constructor(
    options: RedisScheduleDriverOptions = {},
    private readonly factory = new RedisClientFactory(),
  ) {
    if (
      options.keyPrefix !== undefined &&
      (typeof options.keyPrefix !== 'string' || !options.keyPrefix.trim())
    )
      throw new ConfigurationException({
        key: 'schedule.redis.keyPrefix',
        reason: 'Redis keyPrefix must not be empty',
      });
    this.options = { ...options };
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    if (!this.initialization) {
      this.destroyed = false;
      this.initialization = this.connect();
    }
    try {
      await this.initialization;
    } finally {
      this.initialization = undefined;
    }
  }

  async acquireLock(jobName: string, ttlMs: number): Promise<boolean> {
    ScheduleValidator.milliseconds(ttlMs, 1, 'schedule.lockTtlMs');
    const client = this.client;
    if (!client || !this.initialized || this.tokens.has(jobName)) return false;
    const token = randomUUID();
    this.tokens.set(jobName, token);
    try {
      const result = await client.set(this.key(jobName), token, 'PX', ttlMs, 'NX');
      if (result === 'OK' && this.initialized && client === this.client) return true;
      if (this.tokens.get(jobName) === token) this.tokens.delete(jobName);
      return false;
    } catch (error) {
      if (this.tokens.get(jobName) === token) this.tokens.delete(jobName);
      throw error;
    }
  }

  async renewLock(jobName: string, ttlMs: number): Promise<boolean> {
    ScheduleValidator.milliseconds(ttlMs, 1, 'schedule.lockTtlMs');
    const token = this.tokens.get(jobName);
    if (!this.initialized || !this.client || !token) return false;
    return (await this.client.eval(RENEW_LOCK_SCRIPT, 1, this.key(jobName), token, ttlMs)) === 1;
  }

  async releaseLock(jobName: string): Promise<void> {
    const token = this.tokens.get(jobName);
    if (!token || !this.client) return;
    this.tokens.delete(jobName);
    await this.client.eval(RELEASE_LOCK_SCRIPT, 1, this.key(jobName), token);
  }

  async destroy(): Promise<void> {
    this.destroyed = true;
    this.initialized = false;
    const client = this.client;
    this.client = undefined;
    this.tokens.clear();
    client?.disconnect();
  }

  private key(jobName: string): string {
    return `${this.options.keyPrefix ?? 'spraxium:schedule:'}lock:${jobName}`;
  }

  private async connect(): Promise<void> {
    const client = await this.factory.create(this.options);
    try {
      if (this.destroyed) throw new Error('Redis driver was destroyed during initialization');
      this.client = client;
      await client.connect();
      if (this.destroyed) throw new Error('Redis driver was destroyed during initialization');
      this.initialized = true;
    } catch (error) {
      client.disconnect();
      if (this.client === client) this.client = undefined;
      throw error;
    }
  }
}
