import { describe, expect, it, vi } from 'vitest';
import { RedisClientFactory } from '../../src/drivers/redis-client.factory';

vi.mock('ioredis', () => {
  throw new Error('Cannot find package ioredis');
});

describe('Missing optional Redis peer', () => {
  it('reports how to enable Redis without affecting the memory driver', async () => {
    await expect(new RedisClientFactory().create({})).rejects.toMatchObject({
      props: { reason: expect.stringContaining('Install ioredis >=5') },
    });
  });
});
