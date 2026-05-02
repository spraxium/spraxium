/**
 * ConsoleTransport tests
 *
 * `nativeLog/nativeWarn/nativeError` are captured via `bind()` at module-load
 * time (intentionally resilient to post-hoc monkey-patching). Stream routing
 * (info→stdout, error→stderr) therefore cannot be verified with post-hoc
 * `process.stdout.write` spies — it IS exercised and visible in the vitest
 * output captured per-test ("stdout |" / "stderr |" prefixes). These tests
 * focus on the observable, controllable behaviour instead.
 */
import { describe, expect, it } from 'vitest';
import { ConsoleTransport } from '../src/console.transport';
import { CONSOLE_LEVEL_COLORS } from '../src/constants/console-level-colors.constant';
import type { LogEntry } from '../src/interfaces';

function makeEntry(overrides: Partial<LogEntry> = {}): LogEntry {
  return {
    level: 'info',
    message: 'test message',
    timestamp: new Date(),
    ...overrides,
  };
}

describe('ConsoleTransport', () => {
  describe('metadata', () => {
    it('has name "console"', () => {
      expect(new ConsoleTransport().name).toBe('console');
    });
  });

  describe('log() — no throws for any level', () => {
    const transport = new ConsoleTransport();
    const builtInLevels = ['info', 'success', 'warn', 'error', 'debug', 'command'];

    for (const level of builtInLevels) {
      it(`does not throw for level "${level}"`, () => {
        expect(() => transport.log(makeEntry({ level }))).not.toThrow();
      });
    }

    it('does not throw for an unknown / unregistered level', () => {
      expect(() => transport.log(makeEntry({ level: 'unknown-level' }))).not.toThrow();
    });

    it('does not throw when context is provided', () => {
      expect(() => transport.log(makeEntry({ level: 'info', context: 'MyService' }))).not.toThrow();
    });

    it('does not throw when shard is provided', () => {
      expect(() => transport.log(makeEntry({ level: 'info', shard: 3 }))).not.toThrow();
    });
  });

  describe('built-in level colors', () => {
    it('CONSOLE_LEVEL_COLORS covers all built-in levels', () => {
      const expected = ['INFO', 'SUCCESS', 'WARN', 'ERROR', 'DEBUG', 'COMMAND'];
      for (const level of expected) {
        expect(CONSOLE_LEVEL_COLORS).toHaveProperty(level);
        expect(CONSOLE_LEVEL_COLORS[level]).toBeTypeOf('function');
      }
    });

    it('each color function returns a non-empty string', () => {
      for (const fn of Object.values(CONSOLE_LEVEL_COLORS)) {
        const result = fn('test');
        expect(result).toBeTypeOf('string');
        expect(result.length).toBeGreaterThan(0);
      }
    });
  });

  describe('registerColor()', () => {
    it('accepts a LogColor string and does not throw', () => {
      expect(() => ConsoleTransport.registerColor('deploy', 'magenta')).not.toThrow();
    });

    it('accepts a function color and does not throw', () => {
      expect(() => ConsoleTransport.registerColor('audit', (t) => `\x1b[38;5;208m${t}\x1b[0m`)).not.toThrow();
    });

    it('a registered string-color level logs without throwing', () => {
      ConsoleTransport.registerColor('release', 'cyan');
      expect(() => new ConsoleTransport().log(makeEntry({ level: 'release' }))).not.toThrow();
    });

    it('a registered function-color level logs without throwing', () => {
      ConsoleTransport.registerColor('trace', (t) => t);
      expect(() => new ConsoleTransport().log(makeEntry({ level: 'trace' }))).not.toThrow();
    });
  });
});
