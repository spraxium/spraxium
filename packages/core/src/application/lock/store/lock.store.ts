import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { LockData } from '../interfaces';

export class LockStore {
  private static readonly DIR = join(process.cwd(), '.spraxium');
  private static readonly FILE = join(LockStore.DIR, 'spraxium.lock');

  static get path(): string {
    return LockStore.FILE;
  }

  static read(): LockData | null {
    try {
      if (!existsSync(LockStore.FILE)) return null;
      const parsed = JSON.parse(readFileSync(LockStore.FILE, 'utf8')) as Partial<LockData>;
      if (typeof parsed.pid !== 'number') return null;
      return parsed as LockData;
    } catch {
      return null;
    }
  }

  static write(data: LockData): void {
    try {
      if (!existsSync(LockStore.DIR)) mkdirSync(LockStore.DIR, { recursive: true });
      writeFileSync(LockStore.FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch {
      // Read-only filesystem: locking becomes a no-op.
    }
  }

  static remove(): void {
    try {
      if (existsSync(LockStore.FILE)) unlinkSync(LockStore.FILE);
    } catch {
      // Best-effort cleanup.
    }
  }
}
