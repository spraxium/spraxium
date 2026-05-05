import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import type { UpgradeCache } from '../interfaces';

export class UpgradeCacheStore {
  private static readonly DIR = join(homedir(), '.spraxium');
  private static readonly FILE = join(UpgradeCacheStore.DIR, 'upgrade-check.json');

  static get path(): string {
    return UpgradeCacheStore.FILE;
  }

  static read(): UpgradeCache | null {
    try {
      if (!existsSync(UpgradeCacheStore.FILE)) return null;
      const raw = readFileSync(UpgradeCacheStore.FILE, 'utf8');
      const parsed = JSON.parse(raw) as Partial<UpgradeCache>;
      if (typeof parsed.checkedAt !== 'number') return null;
      if (typeof parsed.packages !== 'object' || parsed.packages === null) return null;
      return parsed as UpgradeCache;
    } catch {
      return null;
    }
  }

  static write(cache: UpgradeCache): void {
    try {
      if (!existsSync(UpgradeCacheStore.DIR)) mkdirSync(UpgradeCacheStore.DIR, { recursive: true });
      writeFileSync(UpgradeCacheStore.FILE, JSON.stringify(cache, null, 2), 'utf8');
    } catch {
      // Read-only filesystem (e.g. CI container): caching becomes a no-op.
    }
  }

  static isFresh(cache: UpgradeCache, ttlMs: number): boolean {
    return Date.now() - cache.checkedAt < ttlMs;
  }
}
