import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Fake discord.js Client. Tracks every `on()` call so we can assert whether
 * `CommandLogger.bind()` actually attached an `interactionCreate` listener.
 */
function createFakeClient() {
  const listeners: Array<[string, (...args: unknown[]) => void]> = [];
  return {
    listeners,
    on(event: string, cb: (...args: unknown[]) => void): void {
      listeners.push([event, cb]);
    },
    off(event: string, cb: (...args: unknown[]) => void): void {
      const index = listeners.findIndex(([e, l]) => e === event && l === cb);
      if (index !== -1) listeners.splice(index, 1);
    },
  };
}

describe('Logger.configure({ commandLogging }) + setClient', () => {
  beforeEach(() => {
    // Fresh module state per test so per-client bindings do not leak across cases.
    vi.resetModules();
  });

  it('binds an interactionCreate listener when commandLogging is true', async () => {
    const { Logger } = await import('../src/services/logger.service');
    const client = createFakeClient();

    Logger.configure({ commandLogging: true });
    Logger.setClient(client);

    const interactionListeners = client.listeners.filter(([event]) => event === 'interactionCreate');
    expect(interactionListeners).toHaveLength(1);
  });

  it('does not bind when commandLogging is false or omitted', async () => {
    const { Logger } = await import('../src/services/logger.service');
    const client = createFakeClient();

    Logger.configure({});
    Logger.setClient(client);

    const interactionListeners = client.listeners.filter(([event]) => event === 'interactionCreate');
    expect(interactionListeners).toHaveLength(0);
  });

  it('binds exactly once even when setClient is called repeatedly', async () => {
    const { Logger } = await import('../src/services/logger.service');
    const client = createFakeClient();

    Logger.configure({ commandLogging: true });
    Logger.setClient(client);
    Logger.setClient(client);
    Logger.setClient(client);

    const interactionListeners = client.listeners.filter(([event]) => event === 'interactionCreate');
    expect(interactionListeners).toHaveLength(1);
  });

  it('binds each distinct client once', async () => {
    const { Logger } = await import('../src/services/logger.service');
    const first = createFakeClient();
    const second = createFakeClient();

    Logger.configure({ commandLogging: true });
    Logger.setClient(first);
    Logger.setClient(second);
    Logger.setClient(first);
    Logger.setClient(second);

    for (const client of [first, second]) {
      const interactionListeners = client.listeners.filter(([event]) => event === 'interactionCreate');
      expect(interactionListeners).toHaveLength(1);
    }
  });

  it('logs command events from every bound client', async () => {
    const { Logger } = await import('../src/services/logger.service');
    const first = createFakeClient();
    const second = createFakeClient();
    const seen: Array<string> = [];
    Logger.addTransport({
      name: 'capture',
      log: (entry: { message: string }) => {
        seen.push(entry.message);
      },
    } as never);

    Logger.configure({ commandLogging: true });
    Logger.setClient(first);
    Logger.setClient(second);

    const interaction = (commandName: string) => ({
      isChatInputCommand: () => true,
      commandName,
      user: { tag: 'user#0001', id: '1' },
      guild: null,
      guildId: null,
      channelId: '2',
    });
    for (const [event, cb] of first.listeners) if (event === 'interactionCreate') cb(interaction('first'));
    for (const [event, cb] of second.listeners) if (event === 'interactionCreate') cb(interaction('second'));

    expect(seen.some((m) => m.includes('/first'))).toBe(true);
    expect(seen.some((m) => m.includes('/second'))).toBe(true);
  });

  it('detachClient removes the listener and allows binding again', async () => {
    const { Logger } = await import('../src/services/logger.service');
    const client = createFakeClient();

    Logger.configure({ commandLogging: true });
    Logger.setClient(client);
    Logger.detachClient(client);
    expect(client.listeners.filter(([event]) => event === 'interactionCreate')).toHaveLength(0);

    Logger.setClient(client);
    expect(client.listeners.filter(([event]) => event === 'interactionCreate')).toHaveLength(1);
  });
});
