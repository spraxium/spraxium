import { ANSI, CONSOLE_LEVEL_COLORS } from '../constants';
import type { LogColorInput, LogEntry, LogTransport } from '../interfaces';
import { type TimestampFormat, formatTimestamp, setLocale } from '../utils';

// Bind native console methods at module load time so they remain
// unaffected if anything overrides the console globals later.
export const nativeLog = console.log.bind(console);
export const nativeWarn = console.warn.bind(console);
export const nativeError = console.error.bind(console);

const customColors = new Map<string, (t: string) => string>();
let activeTimestampFormat: TimestampFormat = 'default';

function resolveColorFn(input: LogColorInput): (t: string) => string {
  if (typeof input === 'function') return input;
  return (ANSI as Record<string, (t: string) => string>)[input] ?? ANSI.gray;
}

function formatPrefix(
  level: string,
  colorFn: (t: string) => string,
  context?: string,
  shard?: number,
): string {
  const ts = ANSI.gray(`${formatTimestamp(new Date(), activeTimestampFormat)} - `);
  const lv = colorFn(level);
  const ctx = context ? ANSI.gray(` - [${context}]`) : '';
  const sh = shard !== undefined ? ANSI.gray(` - [Shard ${shard}]`) : '';
  return ts + lv + ctx + sh + ANSI.gray(' - ');
}

/**
 * Writes log entries to stdout/stderr using native ANSI escape codes.
 * Zero external dependencies.
 */
export class ConsoleTransport implements LogTransport {
  readonly name = 'console';

  /** Register a color function for a custom log level. */
  static registerColor(level: string, color: LogColorInput): void {
    customColors.set(level.toUpperCase(), resolveColorFn(color));
  }

  /** Set the timestamp format used in the prefix of every log line. */
  static setTimestampFormat(format: TimestampFormat): void {
    activeTimestampFormat = format;
  }

  /** Set the locale used for time formatting (e.g. `'en-US'`, `'pt-BR'`). Defaults to `'en-US'`. */
  static setLocale(locale: string): void {
    setLocale(locale);
  }

  log(entry: LogEntry): void {
    const upperLevel = entry.level.toUpperCase();
    const colorFn = CONSOLE_LEVEL_COLORS[upperLevel] ?? customColors.get(upperLevel) ?? ANSI.gray;
    const prefix = formatPrefix(upperLevel, colorFn, entry.context, entry.shard);
    const output = prefix + ANSI.gray(entry.message);

    if (entry.level === 'error') {
      nativeError(output);
    } else if (entry.level === 'warn') {
      nativeWarn(output);
    } else {
      nativeLog(output);
    }
  }
}
