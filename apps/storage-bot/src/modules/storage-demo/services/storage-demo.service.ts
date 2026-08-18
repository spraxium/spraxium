import { Injectable, type SpraxiumOnBoot } from '@spraxium/common';
import { Logger } from '@spraxium/logger';
import { type CollectionStore, type DocumentStore, StorageService } from '@spraxium/storage-json';
import { type DemoNote, DemoNotesCollection } from '../storage/demo-notes.collection';
import { type DemoStats, DemoStatsDocument, createDemoStats } from '../storage/demo-stats.document';

export interface StorageDemoSnapshot {
  stats: DemoStats;
  noteCount: number;
}

@Injectable()
export class StorageDemoService implements SpraxiumOnBoot {
  private readonly logger = new Logger(StorageDemoService.name);
  private readonly stats: DocumentStore<DemoStats>;
  private readonly notes: CollectionStore<DemoNote>;

  constructor(storage: StorageService) {
    this.stats = storage.document(DemoStatsDocument);
    this.notes = storage.collection(DemoNotesCollection);
  }

  async onBoot(): Promise<void> {
    const bootCount = await this.stats.update((stats) => {
      stats.bootCount++;
      stats.lastBootAt = new Date().toISOString();
      return stats.bootCount;
    });

    if (!(await this.notes.has('runtime'))) {
      const now = new Date().toISOString();
      await this.notes.set('runtime', {
        content: 'Created once by StorageDemoService.onBoot().',
        createdAt: now,
        updatedAt: now,
        reads: 0,
      });
    }
    this.logger.info(`Persistent storage initialized. Boot count: ${bootCount}.`);
  }

  async snapshot(): Promise<StorageDemoSnapshot> {
    await this.recordCommand();
    return {
      stats: await this.stats.read(),
      noteCount: await this.notes.size(),
    };
  }

  async saveNote(id: string, content: string): Promise<{ note: DemoNote; created: boolean }> {
    let created = false;
    const note = await this.notes.update(id, (current) => {
      created = current === undefined;
      const now = new Date().toISOString();
      return {
        content,
        createdAt: current?.createdAt ?? now,
        updatedAt: now,
        reads: current?.reads ?? 0,
      };
    });

    await this.recordCommand();
    return { note, created };
  }

  async readNote(id: string): Promise<DemoNote | undefined> {
    const current = await this.notes.get(id);
    if (!current) return undefined;
    const note = await this.notes.update(id, (stored) => ({
      ...(stored ?? current),
      reads: (stored?.reads ?? current.reads) + 1,
    }));
    await this.recordCommand();
    return note;
  }

  async removeNote(id: string): Promise<boolean> {
    const removed = await this.notes.delete(id);
    await this.recordCommand();
    return removed;
  }

  async listNotes(): Promise<Array<[string, DemoNote]>> {
    await this.recordCommand();
    return this.notes.entries();
  }

  async reset(): Promise<void> {
    await Promise.all([this.stats.reset(), this.notes.clear()]);

    const replacement = createDemoStats();
    replacement.lastBootAt = new Date().toISOString();
    await this.stats.replace(replacement);
  }

  private async recordCommand(): Promise<void> {
    await this.stats.update((stats) => {
      stats.commandCount++;
    });
  }
}
