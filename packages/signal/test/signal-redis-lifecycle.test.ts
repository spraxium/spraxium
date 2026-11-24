import 'reflect-metadata';
import { ConfigStore } from '@spraxium/core';
import { Client } from 'discord.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { RedisNonceStoreOptions } from '../src/interfaces/redis-nonce-store-options.interface';
import type { RedisNonceClient } from '../src/security/interfaces/redis-nonce-client.interface';
import { NonceCache } from '../src/security/nonce-cache.service';
import { RedisNonceStoreFactory } from '../src/security/redis-nonce-store.factory';
import { RedisNonceStore } from '../src/security/redis-nonce.store';
import { SignalProcessor } from '../src/service/signal-processor.service';
import { SignalRegistry } from '../src/service/signal-registry.service';
import { SignalRouter } from '../src/service/signal-router.service';
import { SignalValidator } from '../src/service/signal-validator.service';
import { defineSignal } from '../src/signal.config';

describe('Signal Redis lifecycle', () => {
  const factory = new RedisNonceStoreFactory();
  const redisOptions: RedisNonceStoreOptions = { type: 'redis', keyPrefix: 'bot-a:' };
  let discord: Client;
  let registry: SignalRegistry;
  let redis: RedisNonceStore;
  const disconnect = vi.fn<RedisNonceClient['disconnect']>();

  beforeEach(() => {
    disconnect.mockClear();
    redis = new RedisNonceStore(
      {
        exists: vi.fn<RedisNonceClient['exists']>().mockResolvedValue(0),
        set: vi.fn<RedisNonceClient['set']>().mockResolvedValue('OK'),
        disconnect,
      },
      1000,
      'bot-a:',
    );
    discord = new Client({ intents: [] });
    const router = new SignalRouter();
    const cache = new NonceCache(factory);
    const processor = new SignalProcessor(new SignalValidator(), router, cache);
    registry = new SignalRegistry(discord, processor, router, cache);
    ConfigStore.load({
      plugins: [
        defineSignal({
          channelId: 'test-channel',
          allowedWebhookIds: ['test-webhook'],
          hmacSecret: 'test-config',
          persistNonces: redisOptions,
        }),
      ],
    });
  });

  afterEach(async () => {
    await registry.onShutdown();
    await discord.destroy();
    ConfigStore.reset();
    vi.restoreAllMocks();
  });

  it('waits for the connection, registers one listener and disconnects on shutdown', async () => {
    const create = vi.spyOn(factory, 'create').mockResolvedValue(redis);
    const firstBoot = registry.onBoot();
    const secondBoot = registry.onBoot();
    expect(discord.listenerCount('messageCreate')).toBe(0);

    await Promise.all([firstBoot, secondBoot]);
    expect(create).toHaveBeenCalledExactlyOnceWith(redisOptions);
    expect(discord.listenerCount('messageCreate')).toBe(1);

    await registry.onShutdown();
    expect(discord.listenerCount('messageCreate')).toBe(0);
    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it('leaves the listener disconnected if Redis setup fails', async () => {
    vi.spyOn(factory, 'create').mockRejectedValue(new Error('Redis unavailable'));

    await expect(registry.onBoot()).rejects.toThrow('Redis unavailable');
    expect(discord.listenerCount('messageCreate')).toBe(0);
  });

  it('does not attach a listener when shutdown starts during connection setup', async () => {
    vi.spyOn(factory, 'create').mockResolvedValue(redis);
    const boot = registry.onBoot();
    const shutdown = registry.onShutdown();

    await Promise.all([boot, shutdown]);
    expect(discord.listenerCount('messageCreate')).toBe(0);
    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
