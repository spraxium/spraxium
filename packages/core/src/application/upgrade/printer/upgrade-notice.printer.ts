import { ANSI, nativeLog } from '@spraxium/logger';
import type { PackageUpgrade } from '../interfaces/package-upgrade.interface';
import { VersionComparator } from '../version/version.comparator';

// biome-ignore lint/suspicious/noControlCharactersInRegex: intentional ANSI escape strip
const ANSI_RE = /\u001b\[[0-9;]*m/g;

export class UpgradeNoticePrinter {
  static printPreview(version: string): void {
    nativeLog(`  ${ANSI.yellow(`Spraxium ${version} is a development build (next).`)}`);
  }

  static print(upgrades: ReadonlyArray<PackageUpgrade>): void {
    const stable: Array<PackageUpgrade> = [];
    const previews: Array<PackageUpgrade> = [];
    for (const upgrade of upgrades) {
      const group = VersionComparator.isPreview(upgrade.available) ? previews : stable;
      group.push(upgrade);
    }
    UpgradeNoticePrinter.printGroup(stable, 'stable', 'Spraxium stable release available');
    UpgradeNoticePrinter.printGroup(previews, 'next', 'Spraxium preview update available');
  }

  private static printGroup(
    upgrades: ReadonlyArray<PackageUpgrade>,
    channel: 'stable' | 'next',
    title: string,
  ): void {
    if (upgrades.length === 0) return;
    const nameWidth = Math.max(...upgrades.map(({ name }) => name.length));
    const versionWidth = Math.max(
      ...upgrades.map(({ current, available }) => current.length + available.length),
    );
    const boxWidth = Math.max(54, nameWidth + versionWidth + 7);
    const top = `  \u250c${'\u2500'.repeat(boxWidth + 2)}\u2510`;
    const bot = `  \u2514${'\u2500'.repeat(boxWidth + 2)}\u2518`;
    const empty = `  \u2502${' '.repeat(boxWidth + 2)}\u2502`;

    nativeLog('');
    nativeLog(ANSI.yellow(top));
    nativeLog(ANSI.yellow(empty));
    nativeLog(UpgradeNoticePrinter.yellowRow(ANSI.bold(`\u2726  ${title}`), boxWidth));
    nativeLog(ANSI.yellow(empty));

    for (const { name, current, available } of upgrades) {
      const line = `${name.padEnd(nameWidth + 2)}${ANSI.dim(current)}  >  ${ANSI.bold(ANSI.green(available))}`;
      nativeLog(UpgradeNoticePrinter.yellowRow(line, boxWidth));
    }

    nativeLog(ANSI.yellow(empty));
    nativeLog(ANSI.yellow(bot));

    nativeLog('');
    nativeLog(ANSI.cyan(`  spraxium use ${channel}`));
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
