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
  };
}

describe('Logger.configure({ commandLogging }) + setClient', () => {
  beforeEach(() => {
    // Fresh module state per test so the one-shot `commandLoggingBound` flag
    // does not leak across cases.
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
});
