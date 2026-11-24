import { isShardChild } from '../../client/shard.util';
import { UpgradeCacheStore } from './cache/upgrade-cache.store';
import { PackageDiscovery } from './discovery/package.discovery';
import type { PackageUpgrade } from './interfaces/package-upgrade.interface';
import type { ReleaseTags } from './interfaces/release-tags.interface';
import { UpgradeNoticePrinter } from './printer/upgrade-notice.printer';
import { NpmRegistryClient } from './registry/npm-registry.client';
import { InstalledVersionResolver } from './version/installed-version.resolver';
import { VersionComparator } from './version/version.comparator';

export class UpgradeChecker {
  private static readonly CACHE_TTL_MS = 24 * 60 * 60 * 1_000;

  static check(): void {
    if (isShardChild()) return;
    const installed = InstalledVersionResolver.resolve(InstalledVersionResolver.CORE_PACKAGE);
    if (installed && VersionComparator.isPreview(installed)) UpgradeNoticePrinter.printPreview(installed);
    if (process.env.SPRAXIUM_NO_UPGRADE_NOTIFIER) return;
    void UpgradeChecker.run();
  }

  private static async run(): Promise<void> {
    try {
      const tracked = [...new Set([InstalledVersionResolver.CORE_PACKAGE, ...PackageDiscovery.discover()])];
      const tags = await UpgradeChecker.resolveTags(tracked);
      const upgrades = UpgradeChecker.collectUpgrades(tracked, tags);

      if (upgrades.length === 0) return;

      UpgradeNoticePrinter.print(upgrades);
    } catch {
      return;
    }
  }

  private static async resolveTags(tracked: ReadonlyArray<string>): Promise<Record<string, ReleaseTags>> {
    const latest = process.env.SPRAXIUM_MOCK_LATEST_VERSION;
    const next = process.env.SPRAXIUM_MOCK_NEXT_VERSION;
    if (latest || next) {
      return Object.fromEntries(tracked.map((name) => [name, { latest, next }]));
    }

    const cached = await UpgradeCacheStore.read();
    if (cached && UpgradeCacheStore.isFresh(cached, UpgradeChecker.CACHE_TTL_MS)) {
      const missing = tracked.filter((name) => !Object.hasOwn(cached.packages, name));
      if (missing.length === 0) return cached.packages;

      const extra = await NpmRegistryClient.fetchReleaseTags(missing);
      if (Object.keys(extra).length === 0) return cached.packages;

      const packages = { ...cached.packages, ...extra };
      await UpgradeCacheStore.write({ ...cached, packages });
      return packages;
    }

    const fresh = await NpmRegistryClient.fetchReleaseTags(tracked);
    if (Object.keys(fresh).length > 0) {
      await UpgradeCacheStore.write({
        schema: UpgradeCacheStore.SCHEMA,
        checkedAt: Date.now(),
        packages: fresh,
      });
    }
    return fresh;
  }

  private static collectUpgrades(
    tracked: ReadonlyArray<string>,
    tags: Record<string, ReleaseTags>,
  ): Array<PackageUpgrade> {
    const upgrades: Array<PackageUpgrade> = [];

    for (const name of tracked) {
      const releases = tags[name];
      const current = InstalledVersionResolver.resolve(name);
      if (!current || !releases) continue;
      const available = VersionComparator.selectUpdate(current, releases);
      if (available) upgrades.push({ name, current, available });
    }

    return upgrades;
  }
}
