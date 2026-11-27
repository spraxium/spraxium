import { randomUUID } from 'node:crypto';
import type { Message } from 'discord.js';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import type { SignalConfig } from '../src/interfaces/signal-config.interface';
import type { SignalHandler } from '../src/interfaces/signal-handler.interface';
import { HmacService } from '../src/security/hmac.service';
import { NonceCache } from '../src/security/nonce-cache.service';
import { RedisNonceStoreFactory } from '../src/security/redis-nonce-store.factory';
import { SignalProcessor } from '../src/service/signal-processor.service';
import { SignalRouter } from '../src/service/signal-router.service';
import { SignalValidator } from '../src/service/signal-validator.service';

const config: SignalConfig = {
  channelId: 'signal-channel',
  allowedWebhookIds: ['signal-webhook'],
  hmacSecret: 'signal-schema-regression-test',
};

function createMessage(payload: Record<string, unknown>): Message {
  const nonce = randomUUID();
  const sentAt = Date.now();
  return {
    id: nonce,
    channelId: config.channelId,
    webhookId: 'signal-webhook',
    content: JSON.stringify({
      v: 1,
      event: 'items.update',
      guildId: 'signal-guild',
      nonce,
      sentAt,
      payload,
      signature: HmacService.compute(nonce, sentAt, payload, config.hmacSecret),
    }),
  } as Message;
}

describe('SignalProcessor schema validation', () => {
  it('rejects oversized signed payloads before walking elements and still processes the next valid signal', async () => {
    const transform = vi.fn((value: string) => value.toUpperCase());
    const execute = vi.fn<SignalHandler['execute']>().mockResolvedValue(undefined);
    const router = new SignalRouter();
    router.register('items.update', {
      event: 'items.update',
      schema: z.object({ items: z.array(z.string().transform(transform)).max(2) }),
      execute,
    });
    const cache = new NonceCache(new RedisNonceStoreFactory());
    const processor = new SignalProcessor(new SignalValidator(), router, cache);

    await processor.process(createMessage({ items: Array.from({ length: 128 }, () => 'item') }), config);

    expect(transform).not.toHaveBeenCalled();
    expect(execute).not.toHaveBeenCalled();

    await processor.process(createMessage({ items: ['valid'] }), config);

    expect(transform).toHaveBeenCalledTimes(1);
    expect(execute).toHaveBeenCalledExactlyOnceWith(
      { items: ['VALID'] },
      expect.objectContaining({ event: 'items.update', guildId: 'signal-guild' }),
    );
  });

  it('drops signed payloads that fail the Zod 4 schema', async () => {
    const execute = vi.fn<SignalHandler['execute']>().mockResolvedValue(undefined);
    const router = new SignalRouter();
    router.register('items.update', {
      event: 'items.update',
      schema: z.object({ items: z.array(z.string()).max(2) }),
      execute,
    });
    const cache = new NonceCache(new RedisNonceStoreFactory());
    const processor = new SignalProcessor(new SignalValidator(), router, cache);

    await processor.process(createMessage({ items: [42] }), config);

    expect(execute).not.toHaveBeenCalled();
  });
});

it('drops a signal when the nonce store is unavailable and processes later signals after recovery', async () => {
  const execute = vi.fn<SignalHandler['execute']>().mockResolvedValue(undefined);
  const cache = new NonceCache(new RedisNonceStoreFactory());
  await cache.configure({
    persistNonces: {
      store: {
        has: vi.fn().mockResolvedValue(false),
        add: vi.fn().mockResolvedValue(undefined),
        addIfAbsent: vi
          .fn()
          .mockRejectedValueOnce(new Error('Store unavailable'))
          .mockResolvedValueOnce(true),
      },
    },
  });
  const router = new SignalRouter();
  router.register('items.update', { event: 'items.update', execute });
  const processor = new SignalProcessor(new SignalValidator(), router, cache);

  await processor.process(createMessage({ items: ['first'] }), config);
  expect(execute).not.toHaveBeenCalled();

  await processor.process(createMessage({ items: ['second'] }), config);
  expect(execute).toHaveBeenCalledExactlyOnceWith(
    { items: ['second'] },
    expect.objectContaining({ event: 'items.update' }),
  );
});
