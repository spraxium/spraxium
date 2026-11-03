import 'reflect-metadata';
import { EventEmitter } from 'node:events';
import type { Client } from 'discord.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SpraxiumStartupError } from '../src/application/errors';
import type { SpraxiumOptions } from '../src/application/interfaces';
import { SpraxiumApplication } from '../src/application/spraxium.application';

class FakeClient extends EventEmitter {
  destroy = vi.fn();
  constructor(private readonly loginImpl: () => Promise<string>) {
    super();
  }
  login(): Promise<string> {
    return this.loginImpl();
  }
}

type Internals = {
  loginAndAwaitReady(client: Client, token: string): Promise<void>;
  resolveToken(): string;
};

function internals(options: SpraxiumOptions): Internals {
  return new SpraxiumApplication(options, Date.now()) as unknown as Internals;
}

describe('SpraxiumApplication embedded startup', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('rejects with LOGIN_FAILED, keeps the cause, and leaves no pending timer or listener', async () => {
    const loginError = new Error('An invalid token was provided.');
    const client = new FakeClient(() => Promise.reject(loginError));

    const result = internals({ exitOnStartupFailure: false }).loginAndAwaitReady(
      client as unknown as Client,
      'bad',
    );

    await expect(result).rejects.toMatchObject({ name: 'SpraxiumStartupError', code: 'LOGIN_FAILED' });
    await result.catch((err: SpraxiumStartupError) => expect(err.cause).toBe(loginError));
    expect(client.destroy).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
    expect(client.listenerCount('clientReady')).toBe(0);
  });

  it('still exits the process on login failure by default', async () => {
    const exit = vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('process.exit');
    }) as never);
    const client = new FakeClient(() => Promise.reject(new Error('An invalid token was provided.')));

    await expect(internals({}).loginAndAwaitReady(client as unknown as Client, 'bad')).rejects.toThrow(
      'process.exit',
    );
    expect(exit).toHaveBeenCalledWith(1);
  });

  it('honors readyTimeoutMs and rejects with READY_TIMEOUT', async () => {
    const client = new FakeClient(() => Promise.resolve('token'));

    const result = internals({ readyTimeoutMs: 5_000 }).loginAndAwaitReady(client as unknown as Client, 'ok');
    const settled = result.catch((err: unknown) => err);

    await vi.advanceTimersByTimeAsync(4_999);
    expect(client.destroy).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    const err = await settled;
    expect(err).toBeInstanceOf(SpraxiumStartupError);
    expect((err as SpraxiumStartupError).code).toBe('READY_TIMEOUT');
    expect((err as Error).message).toContain('within 5s');
    expect(client.destroy).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
    expect(client.listenerCount('clientReady')).toBe(0);
  });

  it('throws NO_TOKEN instead of exiting when exitOnStartupFailure is false', () => {
    const previous = process.env.DISCORD_TOKEN;
    // biome-ignore lint/performance/noDelete: the variable must be absent, not the string "undefined"
    delete process.env.DISCORD_TOKEN;
    try {
      expect(() => internals({ exitOnStartupFailure: false }).resolveToken()).toThrowError(
        expect.objectContaining({ code: 'NO_TOKEN' }),
      );
    } finally {
      if (previous !== undefined) process.env.DISCORD_TOKEN = previous;
    }
  });
});
