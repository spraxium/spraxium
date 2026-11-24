import { describe, expect, it, vi } from 'vitest';
import type { RedisNonceClient } from '../src/security/interfaces/redis-nonce-client.interface';
import { RedisNonceStore } from '../src/security/redis-nonce.store';

function createClient() {
  return {
    exists: vi.fn<RedisNonceClient['exists']>().mockResolvedValue(0),
    set: vi.fn<RedisNonceClient['set']>().mockResolvedValue('OK'),
    disconnect: vi.fn<RedisNonceClient['disconnect']>(),
  };
}

describe('RedisNonceStore', () => {
  it('requests a single reservation with the configured prefix and TTL', async () => {
    const client = createClient();
    client.set.mockResolvedValueOnce('OK').mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    const store = new RedisNonceStore(client, 1501, 'bot-a:');

    await expect(store.addIfAbsent('one')).resolves.toBe(true);
    await expect(store.addIfAbsent('one')).resolves.toBe(false);
    await expect(store.add('one')).resolves.toBeUndefined();

    expect(client.set.mock.calls).toEqual([
      ['bot-a:one', '1', 'PX', 1501, 'NX'],
      ['bot-a:one', '1', 'PX', 1501, 'NX'],
      ['bot-a:one', '1', 'PX', 1501, 'NX'],
    ]);
    expect(client.exists).not.toHaveBeenCalled();
    await store.destroy();
  });

  it('rejects a failed reservation and permits a later one', async () => {
    const client = createClient();
    client.set.mockRejectedValueOnce(new Error('Offline'));
    client.exists.mockRejectedValueOnce(new Error('Offline'));
    const store = new RedisNonceStore(client, 1000, 'bot-a:');

    await expect(store.has('one')).resolves.toBe(false);
    await expect(store.addIfAbsent('one')).rejects.toThrow('Offline');
    await expect(store.addIfAbsent('two')).resolves.toBe(true);
    await store.destroy();
  });

  it('finishes pending reservations before disconnecting and refuses new commands during shutdown', async () => {
    const client = createClient();
    let resolveReservation: (value: 'OK') => void = () => {};
    client.set.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveReservation = resolve;
        }),
    );
    const store = new RedisNonceStore(client, 1000, 'bot-a:');
    const pending = store.addIfAbsent('one');
    const closing = store.destroy();

    try {
      await expect(store.addIfAbsent('two')).rejects.toThrow('closed');
      expect(client.disconnect).not.toHaveBeenCalled();
    } finally {
      resolveReservation('OK');
      await closing;
    }

    await expect(pending).resolves.toBe(true);
    await store.destroy();
    expect(client.set).toHaveBeenCalledTimes(1);
    expect(client.disconnect).toHaveBeenCalledTimes(1);
  });
});
