import type { LockData } from '../interfaces';

// biome-ignore lint/suspicious/noControlCharactersInRegex: intentional ANSI escape strip
const ANSI_RE = /\u001b\[[0-9;]*m/g;

const RED = '\x1b[31m';
const B = '\x1b[1m';
const NORM = '\x1b[22m'; // normal intensity — off bold/dim while preserving colour
const R = '\x1b[0m';

export class LockConflictPrinter {
  private static readonly INNER = 60;

  static print(lock: LockData): void {
    const inner = LockConflictPrinter.INNER;
    const top = `  \u250c${'\u2500'.repeat(inner)}\u2510`;
    const bot = `  \u2514${'\u2500'.repeat(inner)}\u2518`;
    const empty = `  \u2502${' '.repeat(inner)}\u2502`;

    console.log('');
    console.log(`${RED}${top}${R}`);
    console.log(`${RED}${empty}${R}`);
    console.log(LockConflictPrinter.redRow(`${B}\u26a0  Another instance is already running${NORM}`));
    console.log(`${RED}${empty}${R}`);
    console.log(LockConflictPrinter.redRow(`PID         ${lock.pid}`));
    console.log(LockConflictPrinter.redRow(`Started at  ${lock.startedAt}`));
    if (typeof lock.launcherPid === 'number') {
      console.log(LockConflictPrinter.redRow(`Launcher    ${lock.launcherPid}`));
    }
    console.log(`${RED}${empty}${R}`);
    console.log(LockConflictPrinter.redRow('Stop the other instance, or force it with:'));
    console.log(`${RED}${empty}${R}`);
    console.log(LockConflictPrinter.redRow('    pnpm dev --force-unlock'));
    console.log(LockConflictPrinter.redRow('    pnpm start --force-unlock'));
    console.log(`${RED}${empty}${R}`);
    console.log(`${RED}${bot}${R}`);
    console.log('');
  }

  private static redRow(content: string): string {
    const padded = LockConflictPrinter.pad(`  ${content}`, LockConflictPrinter.INNER);
    return `${RED}  \u2502${padded}\u2502${R}`;
  }

  private static pad(text: string, width: number): string {
    const visible = text.replace(ANSI_RE, '').length;
    const diff = width - visible;
    if (diff <= 0) return text;
    return text + ' '.repeat(diff);
  }
}
