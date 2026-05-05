import { ANSI, nativeLog } from '@spraxium/logger';
import type { LockData } from '../interfaces';

// biome-ignore lint/suspicious/noControlCharactersInRegex: ESC sequence matcher
const ANSI_RE = /\u001b\[[0-9;]*m/g;

export class LockConflictPrinter {
  private static readonly INNER = 60;

  static print(lock: LockData): void {
    const inner = LockConflictPrinter.INNER;
    const top = `  \u250c${'\u2500'.repeat(inner)}\u2510`;
    const bot = `  \u2514${'\u2500'.repeat(inner)}\u2518`;
    const empty = `  \u2502${' '.repeat(inner)}\u2502`;

    nativeLog('');
    nativeLog(ANSI.red(top));
    nativeLog(ANSI.red(empty));
    nativeLog(LockConflictPrinter.redRow('\u26A0  Another instance is already running'));
    nativeLog(ANSI.red(empty));
    nativeLog(LockConflictPrinter.redRow(`PID         ${lock.pid}`));
    nativeLog(LockConflictPrinter.redRow(`Started at  ${lock.startedAt}`));
    if (typeof lock.launcherPid === 'number') {
      nativeLog(LockConflictPrinter.redRow(`Launcher    ${lock.launcherPid}`));
    }
    nativeLog(ANSI.red(empty));
    nativeLog(LockConflictPrinter.redRow('Stop the other instance, or force it with:'));
    nativeLog(ANSI.red(empty));
    nativeLog(LockConflictPrinter.redRow('    pnpm dev --force-unlock'));
    nativeLog(LockConflictPrinter.redRow('    pnpm start --force-unlock'));
    nativeLog(ANSI.red(empty));
    nativeLog(ANSI.red(bot));
    nativeLog('');
  }

  private static redRow(content: string): string {
    const padded = LockConflictPrinter.pad(`  ${content}`, LockConflictPrinter.INNER);
    return ANSI.red(`  \u2502${padded}\u2502`);
  }

  private static pad(text: string, width: number): string {
    const visible = text.replace(ANSI_RE, '').length;
    const diff = width - visible;
    if (diff <= 0) return text;
    return text + ' '.repeat(diff);
  }
}
