import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RedisContextAdapter } from '../src/runtime/context/adapters/redis.adapter';
import type { RedisContextAdapterOptions } from '../src/runtime/context/interfaces/context-adapter-options.interface';

const { redisConstructor } = vi.hoisted(() => ({
  redisConstructor: vi.fn(
    class {
      constructor(readonly options: unknown) {}
    },
  ),
}));

vi.mock('node:module', () => ({
  createRequire: () => (specifier: string) => {
    if (specifier !== 'ioredis') throw new Error(`Unexpected dependency: ${specifier}`);
    return redisConstructor;
  },
}));

describe('Redis context authentication', () => {
  beforeEach(() => {
    redisConstructor.mockClear();
  });

  it('forwards a named ACL user and password to ioredis', () => {
    const options: RedisContextAdapterOptions = {
      host: 'redis.internal',
      port: 6380,
      username: 'component-cache',
      password: 'test-only-password',
      db: 2,
      keyPrefix: 'bot:ctx:',
    };

    new RedisContextAdapter(options);

    expect(redisConstructor).toHaveBeenCalledExactlyOnceWith({
      host: options.host,
      port: options.port,
      username: options.username,
      password: options.password,
      db: options.db,
    });
  });

  it('preserves password-only authentication and the default address', () => {
    new RedisContextAdapter({ password: 'test-only-password' });

    expect(redisConstructor).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        host: '127.0.0.1',
        port: 6379,
        password: 'test-only-password',
        db: 0,
      }),
    );
  });
});
