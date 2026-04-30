import { UpgradeCacheStore } from './cache/upgrade-cache.store';
import { PackageDiscovery } from './discovery/package.discovery';
import type { PackageUpgrade } from './interfaces';
import { UpgradeNoticePrinter } from './printer/upgrade-notice.printer';
import { NpmRegistryClient } from './registry/npm-registry.client';
import { InstalledVersionResolver } from './version/installed-version.resolver';
import { VersionComparator } from './version/version.comparator';

/**
 * Tracks every @spraxium/* package the user has installed in node_modules and
 * notifies when an upgrade is available. Fire-and-forget; never blocks startup.
 *
 * Toggles:
 *   SPRAXIUM_NO_UPGRADE_NOTIFIER  disables the check
 *   SPRAXIUM_MOCK_VERSION         fakes the installed version (demos)
 *   SPRAXIUM_MOCK_LATEST_VERSION  fakes the registry latest (never cached)
 */
export class UpgradeChecker {
  private static readonly CACHE_TTL_MS = 24 * 60 * 60 * 1_000;

  static check(): void {
    if (process.env.SPRAXIUM_NO_UPGRADE_NOTIFIER) return;
    void UpgradeChecker.run();
  }

  private static async run(): Promise<void> {
    try {
      const tracked = PackageDiscovery.discover();
      if (tracked.length === 0) return;

      const latestMap = await UpgradeChecker.resolveLatestMap(tracked);
      if (!latestMap) return;

      const upgrades = UpgradeChecker.collectUpgrades(tracked, latestMap);
      if (upgrades.length === 0) return;

      UpgradeNoticePrinter.print(upgrades);
    } catch {
      // Network or fs errors are silenced; the notice is informational only.
    }
  }

  private static async resolveLatestMap(tracked: ReadonlyArray<string>): Promise<Record<string, string> | null> {
    if (!process.env.SPRAXIUM_MOCK_LATEST_VERSION) {
      const cached = UpgradeCacheStore.read();

      if (cached && UpgradeCacheStore.isFresh(cached, UpgradeChecker.CACHE_TTL_MS)) {
        const missing = tracked.filter((name) => !(name in cached.packages));
        if (missing.length === 0) return cached.packages;

        const extra = await UpgradeChecker.fetchLatestMap(missing);
        const merged = { ...cached.packages, ...extra };
        UpgradeCacheStore.write({ checkedAt: cached.checkedAt, packages: merged });
        return merged;
      }
    }

    const fresh = await UpgradeChecker.fetchLatestMap(tracked);
    if (Object.keys(fresh).length === 0) return null;

    if (!process.env.SPRAXIUM_MOCK_LATEST_VERSION) {
      UpgradeCacheStore.write({ checkedAt: Date.now(), packages: fresh });
    }

    return fresh;
  }

  private static async fetchLatestMap(packages: ReadonlyArray<string>): Promise<Record<string, string>> {
    if (process.env.SPRAXIUM_MOCK_LATEST_VERSION) {
      const mock = process.env.SPRAXIUM_MOCK_LATEST_VERSION;
      return Object.fromEntries(packages.map((p) => [p, mock]));
    }

    return NpmRegistryClient.fetchLatestMany(packages);
  }

  private static collectUpgrades(tracked: ReadonlyArray<string>, latestMap: Record<string, string>): Array<PackageUpgrade> {
    const upgrades: Array<PackageUpgrade> = [];

    for (const name of tracked) {
      const current = InstalledVersionResolver.resolve(name);
      if (!current) continue;

      const latest = latestMap[name];
      if (!latest) continue;

      if (VersionComparator.isNewer(latest, current)) {
        upgrades.push({ name, current, latest });
      }
    }

    return upgrades;
  }
}
