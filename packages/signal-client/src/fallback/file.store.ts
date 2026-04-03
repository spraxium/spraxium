import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { FallbackEntry, FallbackStore } from './interfaces';

interface FileData {
  pending: FallbackEntry[];
  deadLetter: FallbackEntry[];
  processed: string[];
}

export class FileFallbackStore implements FallbackStore {
  private data: FileData = { pending: [], deadLetter: [], processed: [] };
  private loaded = false;

  constructor(private readonly filePath: string) {}

  async enqueue(entry: FallbackEntry): Promise<void> {
    await this.load();
    if (this.data.pending.some((e) => e.id === entry.id)) return;
    this.data.pending.push(entry);
    await this.flush();
  }

  async claimBatch(limit: number, now: number): Promise<FallbackEntry[]> {
    await this.load();
    const ready = this.data.pending.filter((e) => e.nextAttemptAt <= now).slice(0, limit);
    return ready;
  }

  async markProcessed(id: string): Promise<void> {
    await this.load();
    this.data.pending = this.data.pending.filter((e) => e.id !== id);
    this.data.processed.push(id);
    if (this.data.processed.length > 10_000) {
      this.data.processed = this.data.processed.slice(-5_000);
    }
    await this.flush();
  }

  async reschedule(id: string, nextAttemptAt: number, reason: string, attempts: number): Promise<void> {
    await this.load();
    const entry = this.data.pending.find((e) => e.id === id);
    if (!entry) return;
    const updated: FallbackEntry = { ...entry, nextAttemptAt, attempts, lastError: reason };
    this.data.pending = this.data.pending.map((e) => (e.id === id ? updated : e));
    await this.flush();
  }

  async moveToDeadLetter(entry: FallbackEntry, reason: string): Promise<void> {
    await this.load();
    this.data.pending = this.data.pending.filter((e) => e.id !== entry.id);
    this.data.deadLetter.push({ ...entry, lastError: reason });
    await this.flush();
  }

  async has(id: string): Promise<boolean> {
    await this.load();
    return this.data.processed.includes(id) || this.data.pending.some((e) => e.id === id);
  }

  async pendingCount(): Promise<number> {
    await this.load();
    return this.data.pending.length;
  }

  async deadLetterCount(): Promise<number> {
    await this.load();
    return this.data.deadLetter.length;
  }

  private async load(): Promise<void> {
    if (this.loaded) return;
    try {
      const raw = await readFile(this.filePath, 'utf-8');
      this.data = JSON.parse(raw) as FileData;
    } catch {
      this.data = { pending: [], deadLetter: [], processed: [] };
    }
    this.loaded = true;
  }

  private async flush(): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
  }
}
