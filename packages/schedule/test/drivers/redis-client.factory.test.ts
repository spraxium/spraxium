import { describe, expect, it, vi } from 'vitest';
import { RedisClientFactory } from '../../src/drivers/redis-client.factory';

const { redisConstructor, client } = vi.hoisted(() => {
  const client = { connect: vi.fn(), disconnect: vi.fn(), set: vi.fn(), eval: vi.fn() };
  class RedisClientMock {
    connect = client.connect;
    disconnect = client.disconnect;
    set = client.set;
    eval = client.eval;
  }
  return { client, redisConstructor: vi.fn(RedisClientMock) };
});

vi.mock('ioredis', () => ({ default: redisConstructor }));

describe('RedisClientFactory', () => {
  it('uses a lazy connection with bounded retries and no offline command queue', async () => {
    expect(await new RedisClientFactory().create({})).toMatchObject(client);
    expect(redisConstructor).toHaveBeenLastCalledWith(
      expect.objectContaining({
        host: '127.0.0.1',
        port: 6379,
        db: 0,
        family: 4,
        lazyConnect: true,
        enableOfflineQueue: false,
        maxRetriesPerRequest: 1,
      }),
    );
  });

  it('preserves explicit ACL, TLS, database and retry options', async () => {
    await new RedisClientFactory().create({
      host: 'redis.local',
      port: 6380,
      username: 'scheduler',
      password: 'test-password',
      db: 2,
      tls: true,
      family: 6,
      connectTimeout: 5000,
      maxRetriesPerRequest: null,
    });
    expect(redisConstructor).toHaveBeenLastCalledWith(
      expect.objectContaining({
        host: 'redis.local',
        port: 6380,
        username: 'scheduler',
        password: 'test-password',
        db: 2,
        tls: {},
        family: 6,
        connectTimeout: 5000,
        maxRetriesPerRequest: null,
      }),
    );
  });

  it.each([
    { host: '' },
    { port: 0 },
    { port: 65536 },
    { db: -1 },
    { db: 0.5 },
    { connectTimeout: 0 },
    { connectTimeout: 2_147_483_648 },
    { maxRetriesPerRequest: -1 },
  ])('rejects invalid client options %j before opening a connection', async (options) => {
    await expect(new RedisClientFactory().create(options)).rejects.toThrow();
  });
});
