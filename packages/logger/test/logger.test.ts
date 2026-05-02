import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConsoleTransport } from '../src/console.transport';
import type { LogEntry, LogTransport } from '../src/interfaces';
import { Logger } from '../src/logger.service';

const FAKE_TOKEN = 'MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMi.GaBcDe.ABCDEFGHIJKLMNOPQRSTUVWXYZabcde';

function makeSpyTransport(name = 'spy'): { transport: LogTransport; entries: Array<LogEntry> } {
  const entries: Array<LogEntry> = [];
  const transport: LogTransport = {
    name,
    log(entry) {
      entries.push({ ...entry });
    },
  };
  return { transport, entries };
}

beforeEach(() => {
  for (const t of [...Logger.getTransports()]) {
    Logger.removeTransport(t.name);
  }
  Logger.setDebug(false);
});

afterEach(() => {
  vi.unstubAllEnvs();
  for (const t of [...Logger.getTransports()]) {
    Logger.removeTransport(t.name);
  }
  // Restore the default console transport and reset shared logger state.
  Logger.addTransport(new ConsoleTransport());
  Logger.setDebug(false);
  Logger.configure({ maskTokens: true });
});

describe('Logger — transport management', () => {
  it('starts with no transports after manual removal', () => {
    expect(Logger.getTransports()).toHaveLength(0);
  });

  it('addTransport() adds a transport', () => {
    const { transport } = makeSpyTransport();
    Logger.addTransport(transport);
    expect(Logger.getTransports()).toHaveLength(1);
  });

  it('addTransport() replaces an existing transport with the same name', () => {
    const { transport: t1 } = makeSpyTransport('dup');
    const { transport: t2 } = makeSpyTransport('dup');
    Logger.addTransport(t1);
    Logger.addTransport(t2);
    expect(Logger.getTransports()).toHaveLength(1);
    expect(Logger.getTransports()[0]).toBe(t2);
  });

  it('removeTransport() removes a transport by name', () => {
    const { transport } = makeSpyTransport('removable');
    Logger.addTransport(transport);
    Logger.removeTransport('removable');
    expect(Logger.getTransports()).toHaveLength(0);
  });

  it('removeTransport() on a non-existent name is a no-op', () => {
    const { transport } = makeSpyTransport();
    Logger.addTransport(transport);
    Logger.removeTransport('does-not-exist');
    expect(Logger.getTransports()).toHaveLength(1);
  });
});

describe('Logger — built-in levels', () => {
  it('info() dispatches an entry with level "info"', () => {
    const { transport, entries } = makeSpyTransport();
    Logger.addTransport(transport);
    new Logger().info('hello');
    expect(entries).toHaveLength(1);
    expect(entries[0].level).toBe('info');
    expect(entries[0].message).toBe('hello');
  });

  it('success() dispatches an entry with level "success"', () => {
    const { transport, entries } = makeSpyTransport();
    Logger.addTransport(transport);
    new Logger().success('done');
    expect(entries[0].level).toBe('success');
  });

  it('warn() dispatches an entry with level "warn"', () => {
    const { transport, entries } = makeSpyTransport();
    Logger.addTransport(transport);
    new Logger().warn('caution');
    expect(entries[0].level).toBe('warn');
  });

  it('error() dispatches an entry with level "error"', () => {
    const { transport, entries } = makeSpyTransport();
    Logger.addTransport(transport);
    new Logger().error('fail');
    expect(entries[0].level).toBe('error');
  });

  it('log() uses the provided level string', () => {
    const { transport, entries } = makeSpyTransport();
    Logger.addTransport(transport);
    new Logger().log('command', 'ran cmd');
    expect(entries[0].level).toBe('command');
  });
});

describe('Logger — entry shape', () => {
  it('entry has a Date timestamp', () => {
    const { transport, entries } = makeSpyTransport();
    Logger.addTransport(transport);
    new Logger().info('ts');
    expect(entries[0].timestamp).toBeInstanceOf(Date);
  });

  it('context from constructor is present in the entry', () => {
    const { transport, entries } = makeSpyTransport();
    Logger.addTransport(transport);
    new Logger('TestService').info('msg');
    expect(entries[0].context).toBe('TestService');
  });

  it('context is undefined when no context label was given', () => {
    const { transport, entries } = makeSpyTransport();
    Logger.addTransport(transport);
    new Logger().info('msg');
    expect(entries[0].context).toBeUndefined();
  });

  it('metadata from log() is present in the entry', () => {
    const { transport, entries } = makeSpyTransport();
    Logger.addTransport(transport);
    new Logger().log('info', 'msg', { userId: '42', action: 'click' });
    expect(entries[0].metadata).toEqual({ userId: '42', action: 'click' });
  });

  it('metadata is undefined when not provided', () => {
    const { transport, entries } = makeSpyTransport();
    Logger.addTransport(transport);
    new Logger().info('no meta');
    expect(entries[0].metadata).toBeUndefined();
  });

  it('shard id comes from the SHARDS env var', () => {
    vi.stubEnv('SHARDS', '2,3,4');
    const { transport, entries } = makeSpyTransport();
    Logger.addTransport(transport);
    new Logger().info('sharded');
    expect(entries[0].shard).toBe(2);
  });

  it('shard is undefined when SHARDS is not set', () => {
    const { transport, entries } = makeSpyTransport();
    Logger.addTransport(transport);
    new Logger().info('no shard');
    expect(entries[0].shard).toBeUndefined();
  });
});

describe('Logger — child()', () => {
  it('creates a logger with the given context label', () => {
    const { transport, entries } = makeSpyTransport();
    Logger.addTransport(transport);
    new Logger().child('ChildCtx').info('from child');
    expect(entries[0].context).toBe('ChildCtx');
  });

  it('child logger dispatches to the same shared transports', () => {
    const { transport, entries } = makeSpyTransport();
    Logger.addTransport(transport);
    new Logger().child('Ctx').warn('something');
    expect(entries).toHaveLength(1);
  });

  it('parent and child dispatch independently', () => {
    const { transport, entries } = makeSpyTransport();
    Logger.addTransport(transport);
    const parent = new Logger('Parent');
    const child = parent.child('Child');
    parent.info('p');
    child.info('c');
    expect(entries[0].context).toBe('Parent');
    expect(entries[1].context).toBe('Child');
  });
});

describe('Logger — debug()', () => {
  it('does not dispatch when debug is off by default', () => {
    const { transport, entries } = makeSpyTransport();
    Logger.addTransport(transport);
    new Logger().debug('hidden');
    expect(entries).toHaveLength(0);
  });

  it('dispatches after setDebug(true)', () => {
    const { transport, entries } = makeSpyTransport();
    Logger.addTransport(transport);
    Logger.setDebug(true);
    new Logger().debug('visible');
    expect(entries).toHaveLength(1);
    expect(entries[0].level).toBe('debug');
  });

  it('dispatches when SPRAXIUM_DEBUG env var is "true"', () => {
    vi.stubEnv('SPRAXIUM_DEBUG', 'true');
    const { transport, entries } = makeSpyTransport();
    Logger.addTransport(transport);
    new Logger().debug('env-debug');
    expect(entries).toHaveLength(1);
  });

  it('is silent again after setDebug(false)', () => {
    const { transport, entries } = makeSpyTransport();
    Logger.addTransport(transport);
    Logger.setDebug(true);
    Logger.setDebug(false);
    new Logger().debug('silent');
    expect(entries).toHaveLength(0);
  });
});

describe('Logger — extend()', () => {
  it('returns a callable function', () => {
    const fn = new Logger().extend('custom');
    expect(fn).toBeTypeOf('function');
  });

  it('dispatches to transports with the given level', () => {
    const { transport, entries } = makeSpyTransport();
    Logger.addTransport(transport);
    const logFn = new Logger().extend('deploy');
    logFn('deployment complete');
    expect(entries[0].level).toBe('deploy');
    expect(entries[0].message).toBe('deployment complete');
  });

  it('accepts a color function for the extended level', () => {
    const { transport, entries } = makeSpyTransport();
    Logger.addTransport(transport);
    const logFn = new Logger().extend('audit', (t) => `[${t}]`);
    logFn('audited');
    expect(entries[0].level).toBe('audit');
  });
});

describe('Logger — token masking', () => {
  it('replaces a Discord token before dispatching to transports', () => {
    Logger.configure({ maskTokens: true });
    const { transport, entries } = makeSpyTransport();
    Logger.addTransport(transport);
    new Logger().info(FAKE_TOKEN);
    expect(entries[0].message).toBe('[REDACTED]');
  });

  it('token is not present in the dispatched message', () => {
    Logger.configure({ maskTokens: true });
    const { transport, entries } = makeSpyTransport();
    Logger.addTransport(transport);
    new Logger().info(`token is ${FAKE_TOKEN} here`);
    expect(entries[0].message).not.toContain(FAKE_TOKEN);
  });

  it('passes the raw message when maskTokens is false', () => {
    Logger.configure({ maskTokens: false });
    const { transport, entries } = makeSpyTransport();
    Logger.addTransport(transport);
    new Logger().info(FAKE_TOKEN);
    expect(entries[0].message).toBe(FAKE_TOKEN);
  });
});

describe('Logger — transport resilience', () => {
  it('a synchronously throwing transport does not crash the logger', () => {
    const bad: LogTransport = {
      name: 'bad-sync',
      log() {
        throw new Error('sync boom');
      },
    };
    Logger.addTransport(bad);
    expect(() => new Logger().info('test')).not.toThrow();
  });

  it('a rejecting async transport does not crash the logger', async () => {
    const bad: LogTransport = {
      name: 'bad-async',
      log() {
        return Promise.reject(new Error('async boom'));
      },
    };
    Logger.addTransport(bad);
    expect(() => new Logger().info('test')).not.toThrow();
    // Allow pending microtasks to settle.
    await Promise.resolve();
  });

  it('subsequent transports still receive the entry after a throwing one', () => {
    const bad: LogTransport = {
      name: 'bad',
      log() {
        throw new Error('boom');
      },
    };
    const { transport, entries } = makeSpyTransport('good');
    Logger.addTransport(bad);
    Logger.addTransport(transport);
    new Logger().info('resilience test');
    expect(entries).toHaveLength(1);
    expect(entries[0].message).toBe('resilience test');
  });

  it('dispatches to all N transports', () => {
    const calls: Array<string> = [];
    for (let i = 0; i < 3; i++) {
      Logger.addTransport({
        name: `t${i}`,
        log: () => {
          calls.push(`t${i}`);
        },
      });
    }
    new Logger().info('broadcast');
    expect(calls).toEqual(['t0', 't1', 't2']);
  });
});
