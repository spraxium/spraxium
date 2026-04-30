import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { FileContextAdapterOptions } from '../interfaces/context-adapter-options.interface';
import type { ContextStorageAdapter } from '../interfaces/context-storage.interface';
import type { SpraxiumContext } from '../interfaces/spraxium-context.interface';

/**
 * File-backed persistence adapter.
 *
 * On creation the existing snapshot is loaded into a hot in-process Map.
 * Every write (`set` / `delete`) flushes the Map back to disk as a JSON file
 * so data survives process restarts with zero extra configuration.
 *
 * Storage location: `<dir>/contexts.json` (default: `.spraxium/contexts.json`)
 */
export class FileContextAdapter implements ContextStorageAdapter {
  private readonly path: string;
  private readonly store = new Map<string, SpraxiumContext<unknown>>();
  private ready: Promise<void>;

  constructor(options: FileContextAdapterOptions = {}) {
    const dir = options.dir ?? '.spraxium';
    this.path = join(dir, 'contexts.json');
    this.ready = this.load();
  }

  private async load(): Promise<void> {
    try {
      await mkdir(join(this.path, '..'), { recursive: true });
      const raw = await readFile(this.path, 'utf-8');
      const entries = JSON.parse(raw) as Array<SpraxiumContext<unknown>>;
      const now = Date.now();
      for (const ctx of entries) {
        if (ctx.expiresAt === 0 || ctx.expiresAt > now) this.store.set(ctx.id, ctx);
      }
    } catch {
      // File does not exist yet or is malformed — start with an empty store.
    }
  }

  private async flush(): Promise<void> {
    await this.ready;
    await mkdir(join(this.path, '..'), { recursive: true });
    const values = Array.from(this.store.values());
    await writeFile(this.path, JSON.stringify(values), 'utf-8');
  }

  async get(id: string): Promise<SpraxiumContext<unknown> | undefined> {
    await this.ready;
    const ctx = this.store.get(id);
    if (!ctx) return undefined;
    if (ctx.expiresAt !== 0 && ctx.expiresAt <= Date.now()) {
      this.store.delete(id);
      void this.flush();
      return undefined;
    }
    return ctx;
  }

  async set(ctx: SpraxiumContext<unknown>): Promise<void> {
    await this.ready;
    this.store.set(ctx.id, ctx);
    await this.flush();
  }

  async delete(id: string): Promise<void> {
    await this.ready;
    this.store.delete(id);
    await this.flush();
  }

  async entries(): Promise<ReadonlyArray<SpraxiumContext<unknown>>> {
    await this.ready;
    return Array.from(this.store.values());
  }
}
