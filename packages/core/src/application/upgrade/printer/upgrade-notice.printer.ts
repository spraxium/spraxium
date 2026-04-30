import chalk from 'chalk';
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
    const empty = `  \u2502 ${' '.repeat(boxWidth)} \u2502`;
    const row = (content: string): string => `  \u2502 ${UpgradeNoticePrinter.pad(content, boxWidth)} \u2502`;

    console.log('');
    console.log(chalk.yellow(top));
    console.log(chalk.yellow(empty));
    console.log(chalk.yellow(row(chalk.bold('\u2726  Spraxium upgrade available'))));
    console.log(chalk.yellow(empty));

    for (const { name, current, latest } of upgrades) {
      const line = `${name.padEnd(nameWidth + 2)}${chalk.dim(current)}  >  ${chalk.green.bold(latest)}`;
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

  private static pad(text: string, width: number): string {
    const visible = text.replace(ANSI_RE, '').length;
    const diff = width - visible;
    if (diff <= 0) return text;
    return text + ' '.repeat(diff);
  }
}
