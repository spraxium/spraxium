import { UpgradeCacheStore } from './cache/upgrade-cache.store';
import type { PackageUpgrade } from './interfaces';
import { UpgradeNoticePrinter } from './printer/upgrade-notice.printer';
import { NpmRegistryClient } from './registry/npm-registry.client';
import { InstalledVersionResolver } from './version/installed-version.resolver';
import { VersionComparator } from './version/version.comparator';

/**
 * Orchestrates the upgrade-check flow:
 *
 *   1. Resolve the registry snapshot (cached or fresh from npm).
 *   2. Compare each tracked package's installed version against the snapshot.
 *   3. Print a single notice listing only packages that have an upgrade available.
 *
 * The check is fire-and-forget — it never blocks application startup.
 *
 * Environment toggles:
 *   SPRAXIUM_NO_UPGRADE_NOTIFIER  — disables the check entirely
 *   SPRAXIUM_MOCK_VERSION         — fakes the installed version (demos)
 *   SPRAXIUM_MOCK_LATEST_VERSION  — fakes the registry latest (demos, never cached)
 */
export class UpgradeChecker {
  private static readonly CACHE_TTL_MS = 24 * 60 * 60 * 1_000;

  private static readonly TRACKED_PACKAGES: ReadonlyArray<string> = [
    '@spraxium/core',
    '@spraxium/common',
    '@spraxium/env',
    '@spraxium/components',
    '@spraxium/i18n',
    '@spraxium/schedule',
    '@spraxium/signal',
    '@spraxium/signal-client',
    '@spraxium/webhook',
    '@spraxium/http',
  ];

  static check(): void {
    if (process.env.SPRAXIUM_NO_UPGRADE_NOTIFIER) return;
    void UpgradeChecker.run();
  }

  private static async run(): Promise<void> {
    try {
      const latestMap = await UpgradeChecker.resolveLatestMap();
      if (!latestMap) return;

      const upgrades = UpgradeChecker.collectUpgrades(latestMap);
      if (upgrades.length === 0) return;

      UpgradeNoticePrinter.print(upgrades);
    } catch {
      // Network or fs errors are silenced — the notice is informational only.
    }
  }

  private static async resolveLatestMap(): Promise<Record<string, string> | null> {
    const cached = UpgradeCacheStore.read();

    if (cached && UpgradeCacheStore.isFresh(cached, UpgradeChecker.CACHE_TTL_MS)) {
      return cached.packages;
    }

    const fresh = await UpgradeChecker.fetchLatestMap();
    if (Object.keys(fresh).length === 0) return null;

    // Mocked data must never poison the user-global cache shared across projects.
    if (!process.env.SPRAXIUM_MOCK_LATEST_VERSION) {
      UpgradeCacheStore.write({ checkedAt: Date.now(), packages: fresh });
    }

    return fresh;
  }

  private static async fetchLatestMap(): Promise<Record<string, string>> {
    if (process.env.SPRAXIUM_MOCK_LATEST_VERSION) {
      const mock = process.env.SPRAXIUM_MOCK_LATEST_VERSION;
      return Object.fromEntries(UpgradeChecker.TRACKED_PACKAGES.map((p) => [p, mock]));
    }

    return NpmRegistryClient.fetchLatestMany(UpgradeChecker.TRACKED_PACKAGES);
  }

  private static collectUpgrades(latestMap: Record<string, string>): Array<PackageUpgrade> {
    const upgrades: Array<PackageUpgrade> = [];

    for (const name of UpgradeChecker.TRACKED_PACKAGES) {
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
