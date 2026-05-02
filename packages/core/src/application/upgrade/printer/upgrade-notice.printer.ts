import { ANSI, nativeLog } from '@spraxium/logger';
import type { PackageUpgrade } from '../interfaces';

// biome-ignore lint/suspicious/noControlCharactersInRegex: intentional ANSI escape strip
const ANSI_RE = /\u001b\[[0-9;]*m/g;

export class UpgradeNoticePrinter {
  static print(upgrades: ReadonlyArray<PackageUpgrade>): void {
    const nameWidth = Math.max(...upgrades.map((u) => u.name.length));
    const boxWidth = Math.max(54, nameWidth + 24);

    UpgradeNoticePrinter.renderBox(upgrades, nameWidth, boxWidth);
    UpgradeNoticePrinter.renderCommand(upgrades);
  }

  private static renderBox(
    upgrades: ReadonlyArray<PackageUpgrade>,
    nameWidth: number,
    boxWidth: number,
  ): void {
    const top = `  \u250c${'\u2500'.repeat(boxWidth + 2)}\u2510`;
    const bot = `  \u2514${'\u2500'.repeat(boxWidth + 2)}\u2518`;
    const empty = `  \u2502${' '.repeat(boxWidth + 2)}\u2502`;

    nativeLog('');
    nativeLog(ANSI.yellow(top));
    nativeLog(ANSI.yellow(empty));
    nativeLog(UpgradeNoticePrinter.yellowRow(ANSI.bold('\u2726  Spraxium upgrade available'), boxWidth));
    nativeLog(ANSI.yellow(empty));

    for (const { name, current, latest } of upgrades) {
      // dim current version (NORM restores intensity without resetting yellow),
      // then switch to bold-green for latest (restore yellow afterwards).
      const line = `${name.padEnd(nameWidth + 2)}${ANSI.dim(current)}  >  ${ANSI.bold(ANSI.green(latest))}`;
      nativeLog(UpgradeNoticePrinter.yellowRow(line, boxWidth));
    }

    nativeLog(ANSI.yellow(empty));
    nativeLog(ANSI.yellow(bot));
  }

  private static renderCommand(upgrades: ReadonlyArray<PackageUpgrade>): void {
    const command = `pnpm add ${upgrades.map((u) => `${u.name}@${u.latest}`).join(' ')}`;

    nativeLog('');
    nativeLog(ANSI.dim('  Run to upgrade:'));
    nativeLog(ANSI.cyan(`  ${command}`));
    nativeLog('');
  }

  /**
   * Wraps `content` in a yellow box row, correctly measuring visible width by
   * stripping ANSI codes before padding.  Re-asserts yellow after content so
   * that inner color resets (from nested ANSI helpers) don't affect borders.
   */
  private static yellowRow(content: string, boxWidth: number): string {
    const visible = content.replace(ANSI_RE, '').length;
    const pad = Math.max(0, boxWidth - visible);
    // Re-assert yellow (\x1b[33m) before the padding so border chars stay yellow
    // even when `content` ends with a full \x1b[0m reset from a nested helper.
    return `\x1b[33m  \u2502 ${content}\x1b[33m${' '.repeat(pad)} \u2502\x1b[0m`;
  }
}
