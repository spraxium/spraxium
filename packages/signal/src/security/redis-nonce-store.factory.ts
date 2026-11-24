import { setTimeout as delay } from 'node:timers/promises';
import { Injectable } from '@spraxium/common';
import { logger } from '@spraxium/logger';
import { NONCE_TTL_MS } from '../constants/defaults.constant';
import { SIGNAL_MESSAGES } from '../constants/messages.constant';
import type { RedisNonceStoreOptions } from '../interfaces/redis-nonce-store-options.interface';
import { RedisNonceStore } from './redis-nonce.store';

const CONNECT_TIMEOUT_MS = 5_000;
const COMMAND_TIMEOUT_MS = 2_000;
const DEFAULT_PREFIX = 'spraxium:signal:nonce:';
const log = logger.child('RedisNonceStore');

@Injectable()
export class RedisNonceStoreFactory {
  async create(options: RedisNonceStoreOptions): Promise<RedisNonceStore> {
    this.validate(options);
    const Redis = await this.loadClient();
    const client = new Redis({
      host: options.host ?? '127.0.0.1',
      port: options.port ?? 6379,
      username: options.username,
      password: options.password,
      db: options.db ?? 0,
      tls: options.tls ? {} : undefined,
      lazyConnect: true,
      enableOfflineQueue: false,
      autoResendUnfulfilledCommands: false,
      connectTimeout: CONNECT_TIMEOUT_MS,
      commandTimeout: COMMAND_TIMEOUT_MS,
      maxRetriesPerRequest: 0,
    });

    client.on('error', this.reportConnectionError);
    const timeout = new AbortController();
    try {
      const ready = await Promise.race([
        client.connect().then(() => true),
        delay(CONNECT_TIMEOUT_MS, false, { signal: timeout.signal }),
      ]);
      if (!ready) throw new Error('Redis connection timed out.');
    } catch {
      client.disconnect();
      throw new Error(
        'Could not connect to Redis for Signal nonces. Check the address, authentication, and TLS settings.',
      );
    } finally {
      timeout.abort();
    }

    return new RedisNonceStore(client, NONCE_TTL_MS, options.keyPrefix ?? DEFAULT_PREFIX);
  }

  private async loadClient() {
    try {
      const { default: Redis } = await import('ioredis');
      return Redis;
    } catch {
      throw new Error('Redis nonce persistence requires ioredis. Install it with pnpm add ioredis.');
    }
  }

  private reportConnectionError(): void {
    log.warn(SIGNAL_MESSAGES.REDIS_NONCE_CONNECTION_ERROR);
  }

  private validate(options: RedisNonceStoreOptions): void {
    if (options.host !== undefined && (typeof options.host !== 'string' || !options.host.trim())) {
      this.invalid('host');
    }
    if (
      options.port !== undefined &&
      (!Number.isInteger(options.port) || options.port < 1 || options.port > 65_535)
    ) {
      this.invalid('port');
    }
    if (options.username !== undefined && typeof options.username !== 'string') this.invalid('username');
    if (options.password !== undefined && typeof options.password !== 'string') this.invalid('password');
    if (options.db !== undefined && (!Number.isSafeInteger(options.db) || options.db < 0)) this.invalid('db');
    if (options.tls !== undefined && typeof options.tls !== 'boolean') this.invalid('tls');
    if (
      options.keyPrefix !== undefined &&
      (typeof options.keyPrefix !== 'string' || !options.keyPrefix.trim())
    ) {
      this.invalid('keyPrefix');
    }
  }

  private invalid(option: keyof RedisNonceStoreOptions): never {
    throw new Error(`Invalid Signal Redis nonce option "${option}".`);
  }
}
