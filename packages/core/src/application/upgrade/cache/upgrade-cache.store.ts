import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import type { UpgradeCache } from '../interfaces/upgrade-cache.interface';

export class UpgradeCacheStore {
  static readonly SCHEMA = 2;
  private static readonly DIR = join(homedir(), '.spraxium');
  private static readonly FILE = join(UpgradeCacheStore.DIR, 'upgrade-check.json');

  static get path(): string {
    return UpgradeCacheStore.FILE;
  }

  static async read(): Promise<UpgradeCache | null> {
    try {
      const raw = await readFile(UpgradeCacheStore.FILE, 'utf8');
      const parsed = JSON.parse(raw) as Partial<UpgradeCache> | null;
      if (parsed?.schema !== UpgradeCacheStore.SCHEMA || !Number.isFinite(parsed.checkedAt)) return null;
      if (!parsed.packages || typeof parsed.packages !== 'object' || Array.isArray(parsed.packages))
        return null;
      for (const tags of Object.values(parsed.packages)) {
        if (!tags || typeof tags !== 'object' || Array.isArray(tags)) return null;
        if (tags.latest !== undefined && typeof tags.latest !== 'string') return null;
        if (tags.next !== undefined && typeof tags.next !== 'string') return null;
      }
      return parsed as UpgradeCache;
    } catch {
      return null;
    }
  }

  static async write(cache: UpgradeCache): Promise<void> {
    const temp = `${UpgradeCacheStore.FILE}.${randomUUID()}.tmp`;
    try {
      await mkdir(UpgradeCacheStore.DIR, { recursive: true });
      await writeFile(temp, JSON.stringify(cache, null, 2), 'utf8');
      await rename(temp, UpgradeCacheStore.FILE);
    } catch {
      await rm(temp, { force: true }).catch(() => undefined);
    }
  }

  static isFresh(cache: UpgradeCache, ttlMs: number): boolean {
    const age = Date.now() - cache.checkedAt;
    return age >= 0 && age < ttlMs;
  }
}
