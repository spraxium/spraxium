import chalk from 'chalk';
import type { LockData } from '../interfaces';

// biome-ignore lint/suspicious/noControlCharactersInRegex: intentional ANSI escape strip
const ANSI_RE = /\u001b\[[0-9;]*m/g;

export class LockConflictPrinter {
  private static readonly INNER = 60;

  static print(lock: LockData): void {
    const inner = LockConflictPrinter.INNER;
    const top = `  \u250c${'\u2500'.repeat(inner)}\u2510`;
    const bot = `  \u2514${'\u2500'.repeat(inner)}\u2518`;
    const empty = `  \u2502${' '.repeat(inner)}\u2502`;

    const row = (content: string): string => {
      const padded = LockConflictPrinter.pad(`  ${content}`, inner);
      return `  \u2502${padded}\u2502`;
    };

    console.log('');
    console.log(chalk.red(top));
    console.log(chalk.red(empty));
    console.log(chalk.red(row(chalk.red.bold('\u26a0  Another instance is already running'))));
    console.log(chalk.red(empty));
    console.log(chalk.red(row(chalk.red(`PID         ${lock.pid}`))));
    console.log(chalk.red(row(chalk.red(`Started at  ${lock.startedAt}`))));
    if (typeof lock.launcherPid === 'number') {
      console.log(chalk.red(row(chalk.red(`Launcher    ${lock.launcherPid}`))));
    }
    console.log(chalk.red(empty));
    console.log(chalk.red(row(chalk.red('Stop the other instance, or force it with:'))));
    console.log(chalk.red(empty));
    console.log(chalk.red(row(chalk.red('    pnpm dev --force-unlock'))));
    console.log(chalk.red(row(chalk.red('    pnpm start --force-unlock'))));
    console.log(chalk.red(empty));
    console.log(chalk.red(bot));
    console.log('');
  }

  private static pad(text: string, width: number): string {
    const visible = text.replace(ANSI_RE, '').length;
    const diff = width - visible;
    if (diff <= 0) return text;
    return text + ' '.repeat(diff);
  }
}
