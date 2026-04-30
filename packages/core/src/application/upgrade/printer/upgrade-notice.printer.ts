import chalk from 'chalk';
import type { PackageUpgrade } from '../interfaces';

/**
 * Prints the formatted upgrade notice to stdout.
 *
 * Layout:
 *   - Boxed list of packages with current → latest versions.
 *   - The install command is rendered OUTSIDE the box on a single line so it
 *     can be selected and copied with the mouse without the box characters.
 */
export class UpgradeNoticePrinter {
  static print(upgrades: ReadonlyArray<PackageUpgrade>): void {
    const nameWidth = Math.max(...upgrades.map((u) => u.name.length));
    const boxWidth = Math.max(54, nameWidth + 24);

    UpgradeNoticePrinter.renderBox(upgrades, nameWidth, boxWidth);
    UpgradeNoticePrinter.renderCommand(upgrades);
  }

  private static renderBox(upgrades: ReadonlyArray<PackageUpgrade>, nameWidth: number, boxWidth: number): void {
    const top   = `  \u250c${'\u2500'.repeat(boxWidth + 2)}\u2510`;
    const bot   = `  \u2514${'\u2500'.repeat(boxWidth + 2)}\u2518`;
    const empty = `  \u2502 ${' '.repeat(boxWidth)} \u2502`;
    const row   = (content: string): string => `  \u2502 ${UpgradeNoticePrinter.pad(content, boxWidth)} \u2502`;

    console.log('');
    console.log(chalk.yellow(top));
    console.log(chalk.yellow(empty));
    console.log(chalk.yellow(row(chalk.bold('\u2726  Spraxium upgrade available'))));
    console.log(chalk.yellow(empty));

    for (const { name, current, latest } of upgrades) {
      const line = `${name.padEnd(nameWidth + 2)}${chalk.dim(current)}  \u2192  ${chalk.green.bold(latest)}`;
      console.log(chalk.yellow(row(line)));
    }

    console.log(chalk.yellow(empty));
    console.log(chalk.yellow(bot));
  }

  private static renderCommand(upgrades: ReadonlyArray<PackageUpgrade>): void {
    const command = `pnpm add ${upgrades.map((u) => `${u.name}@${u.latest}`).join(' ')}`;

    console.log('');
    console.log(chalk.dim('  Run to upgrade:'));
    console.log(chalk.cyan(`  ${command}`));
    console.log('');
  }

  /** Pads a string to the given visible width, ignoring ANSI escape sequences. */
  private static pad(text: string, width: number): string {
    const visible = text.replace(/\u001b\[[0-9;]*m/g, '');
    return text + ' '.repeat(Math.max(0, width - visible.length));
  }
}
