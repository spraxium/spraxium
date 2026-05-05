import { mkdir, open, readFile, rename, stat, unlink, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { FallbackEntry, FallbackStore } from './interfaces';

interface FileData {
  pending: FallbackEntry[];
  deadLetter: FallbackEntry[];
  processed: string[];
}

/** Max time a lock attempt will wait before giving up, in ms. */
const LOCK_TIMEOUT_MS = 5_000;
/** Initial backoff between lock-acquisition retries, in ms. */
const LOCK_BACKOFF_MS = 25;
/** Consider a lock stale if its mtime is older than this, in ms. */
const STALE_LOCK_MS = 30_000;

/**
 * JSON-file backed {@link FallbackStore}. Multiple processes may share the
 * same file safely - each read-modify-write cycle is protected by an atomic
 * `.lock` sidecar file acquired with `O_CREAT | O_EXCL`.
 *
 * Design notes:
 * - Reads re-load from disk inside the lock so stale in-memory data cannot
 *   overwrite another process's commits.
 * - Writes go through a temp-file + rename for atomicity.
 * - Stale locks (dead pid or old mtime) are stolen so a crash does not wedge
 *   the fallback pipeline forever.
 */
export class FileFallbackStore implements FallbackStore {
  private data: FileData = { pending: [], deadLetter: [], processed: [] };
  private readonly lockPath: string;

  constructor(private readonly filePath: string) {
    this.lockPath = `${filePath}.lock`;
  }

  async enqueue(entry: FallbackEntry): Promise<void> {
    await this.withLock(async () => {
      await this.loadLocked();
      if (this.data.pending.some((e) => e.id === entry.id)) return;
      this.data.pending.push(entry);
      await this.flushLocked();
    });
  }

  async claimBatch(limit: number, now: number): Promise<FallbackEntry[]> {
    return this.withLock(async () => {
      await this.loadLocked();
      return this.data.pending.filter((e) => e.nextAttemptAt <= now).slice(0, limit);
    });
  }

  async markProcessed(id: string): Promise<void> {
    await this.withLock(async () => {
      await this.loadLocked();
      this.data.pending = this.data.pending.filter((e) => e.id !== id);
      this.data.processed.push(id);
      if (this.data.processed.length > 10_000) {
        this.data.processed = this.data.processed.slice(-5_000);
      }
      await this.flushLocked();
    });
  }

  async reschedule(id: string, nextAttemptAt: number, reason: string, attempts: number): Promise<void> {
    await this.withLock(async () => {
      await this.loadLocked();
      const entry = this.data.pending.find((e) => e.id === id);
      if (!entry) return;
      const updated: FallbackEntry = { ...entry, nextAttemptAt, attempts, lastError: reason };
      this.data.pending = this.data.pending.map((e) => (e.id === id ? updated : e));
      await this.flushLocked();
    });
  }

  async moveToDeadLetter(entry: FallbackEntry, reason: string): Promise<void> {
    await this.withLock(async () => {
      await this.loadLocked();
      this.data.pending = this.data.pending.filter((e) => e.id !== entry.id);
      this.data.deadLetter.push({ ...entry, lastError: reason });
      await this.flushLocked();
    });
  }

  async has(id: string): Promise<boolean> {
    return this.withLock(async () => {
      await this.loadLocked();
      return this.data.processed.includes(id) || this.data.pending.some((e) => e.id === id);
    });
  }

  async pendingCount(): Promise<number> {
    return this.withLock(async () => {
      await this.loadLocked();
      return this.data.pending.length;
    });
  }

  async deadLetterCount(): Promise<number> {
    return this.withLock(async () => {
      await this.loadLocked();
      return this.data.deadLetter.length;
    });
  }

  private async loadLocked(): Promise<void> {
    try {
      const raw = await readFile(this.filePath, 'utf-8');
      const parsed = JSON.parse(raw) as unknown;
      if (!FileFallbackStore.isFileData(parsed)) {
        throw new Error('Invalid fallback snapshot shape');
      }
      this.data = parsed;
    } catch (err) {
      if (FileFallbackStore.isEnoent(err)) {
        this.data = { pending: [], deadLetter: [], processed: [] };
        return;
      }

      const backupPath = `${this.filePath}.corrupt-${Date.now()}`;
      try {
        await rename(this.filePath, backupPath);
      } catch {}

      this.data = { pending: [], deadLetter: [], processed: [] };
      const reason = err instanceof Error ? err.message : String(err);
      process.emitWarning(
        `FileFallbackStore reset an invalid snapshot. Backup: ${backupPath}. Reason: ${reason}`,
      );
    }
  }

  private async flushLocked(): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    const tmpPath = `${this.filePath}.tmp`;
    await writeFile(tmpPath, JSON.stringify(this.data, null, 2), 'utf-8');
    await rename(tmpPath, this.filePath);
  }

  /**
   * Acquires the `.lock` sidecar (atomic create-exclusive), runs `fn`, and
   * releases the lock in a `finally`. Retries with exponential backoff up to
   * `LOCK_TIMEOUT_MS`. Stale locks are stolen on the first retry where the
   * holder is no longer alive.
   */
  private async withLock<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquireLock();
    try {
      return await fn();
    } finally {
      await this.releaseLock();
    }
  }

  private async acquireLock(): Promise<void> {
    const deadline = Date.now() + LOCK_TIMEOUT_MS;
    let backoff = LOCK_BACKOFF_MS;
    let stealAttempted = false;

    while (true) {
      try {
        await mkdir(dirname(this.lockPath), { recursive: true });
        const fh = await open(this.lockPath, 'wx');
        try {
          await fh.writeFile(String(process.pid));
        } finally {
          await fh.close();
        }
        return;
      } catch (err: unknown) {
        if (!FileFallbackStore.isEExist(err)) throw err;

        if (!stealAttempted && (await this.tryStealStaleLock())) {
          stealAttempted = true;
          continue;
        }

        if (Date.now() >= deadline) {
          throw new Error(
            `FileFallbackStore: could not acquire ${this.lockPath} within ${LOCK_TIMEOUT_MS}ms`,
          );
        }

        const jitter = Math.random() * backoff;
        await FileFallbackStore.sleep(backoff + jitter);
        backoff = Math.min(backoff * 2, 250);
      }
    }
  }

  private async releaseLock(): Promise<void> {
    try {
      await unlink(this.lockPath);
    } catch {
      // Best-effort: another process may have already stolen the lock.
    }
  }

  private async tryStealStaleLock(): Promise<boolean> {
    let holderPid: number | undefined;
    try {
      const pidStr = (await readFile(this.lockPath, 'utf-8')).trim();
      const parsed = Number.parseInt(pidStr, 10);
      if (Number.isFinite(parsed)) holderPid = parsed;
    } catch {
      // Lock vanished between EEXIST and read - retry normally.
      return false;
    }

    const info = await stat(this.lockPath).catch(() => undefined);
    const ageMs = info ? Date.now() - info.mtimeMs : 0;

    const pidDead =
      holderPid !== undefined && holderPid !== process.pid && !FileFallbackStore.isProcessAlive(holderPid);
    const fileStale = ageMs > STALE_LOCK_MS;

    if (pidDead || fileStale) {
      try {
        await unlink(this.lockPath);
        return true;
      } catch {
        // Someone else beat us to it; the next acquire() attempt will succeed.
        return false;
      }
    }
    return false;
  }

  private static isEExist(err: unknown): boolean {
    return typeof err === 'object' && err !== null && (err as NodeJS.ErrnoException).code === 'EEXIST';
  }

  private static isEnoent(err: unknown): boolean {
    return typeof err === 'object' && err !== null && (err as NodeJS.ErrnoException).code === 'ENOENT';
  }

  private static isFileData(value: unknown): value is FileData {
    if (typeof value !== 'object' || value === null) return false;
    const data = value as Partial<FileData>;
    return Array.isArray(data.pending) && Array.isArray(data.deadLetter) && Array.isArray(data.processed);
  }

  private static isProcessAlive(pid: number): boolean {
    try {
      // Signal 0 does nothing but throws ESRCH if the pid does not exist.
      process.kill(pid, 0);
      return true;
    } catch {
      return false;
    }
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
