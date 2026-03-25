import chalk, { type ChalkInstance } from 'chalk';
import { CONSOLE_LEVEL_COLORS } from './constants';
import type { LogColorInput, LogEntry, LogTransport } from './interfaces';
import { formatDate, formatTime } from './utils';

// Bind native console methods at module load time so they remain
// unaffected when the plugin console guard overrides the globals.
export const nativeLog = console.log.bind(console);
export const nativeWarn = console.warn.bind(console);
export const nativeError = console.error.bind(console);

const customColors = new Map<string, ChalkInstance>();

function resolveColor(input: LogColorInput): ChalkInstance {
  return typeof input === 'string' ? (chalk[input] as ChalkInstance) : input;
}

function formatPrefix(level: string, colorFn: ChalkInstance, context?: string, shard?: number): string {
  const ts = chalk.gray(`${formatDate()} - ${formatTime()} - `);
  const lv = colorFn(level);
  const ctx = context ? chalk.gray(` - [${context}]`) : '';
  const sh = shard !== undefined ? chalk.gray(` - [Shard ${shard}]`) : '';
  return ts + lv + ctx + sh + chalk.gray(' - ');
}

export class ConsoleTransport implements LogTransport {
  readonly name = 'console';

  static registerColor(level: string, color: LogColorInput): void {
    customColors.set(level.toUpperCase(), resolveColor(color));
  }

  log(entry: LogEntry): void {
    const upperLevel = entry.level.toUpperCase();
    const colorFn = CONSOLE_LEVEL_COLORS[upperLevel] ?? customColors.get(upperLevel) ?? chalk.gray;
    const prefix = formatPrefix(upperLevel, colorFn, entry.context, entry.shard);
    const output = prefix + chalk.gray(entry.message);

    if (entry.level === 'error') {
      nativeError(output);
    } else if (entry.level === 'warn') {
      nativeWarn(output);
    } else {
      nativeLog(output);
    }
  }
}
