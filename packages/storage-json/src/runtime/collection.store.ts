import type { AtomicJsonFile } from './atomic-json-file';

const UNSAFE_ENTRY_IDS = new Set(['__proto__', 'constructor', 'prototype']);

export class CollectionStore<T> {
  constructor(private readonly file: AtomicJsonFile<Record<string, T>>) {}

  get name(): string {
    return this.file.name;
  }

  async get(id: string): Promise<T | undefined> {
    const entries = await this.file.read();
    return entries[id];
  }

  async has(id: string): Promise<boolean> {
    const entries = await this.file.read();
    return Object.hasOwn(entries, id);
  }

  async set(id: string, value: T): Promise<void> {
    this.assertId(id);
    await this.file.mutate((entries) => {
      entries[id] = value;
    });
  }

  async update(id: string, updater: (current: T | undefined) => T | Promise<T>): Promise<T> {
    this.assertId(id);
    return this.file.mutate(async (entries) => {
      const next = await updater(entries[id]);
      entries[id] = next;
      return structuredClone(next);
    });
  }

  async delete(id: string): Promise<boolean> {
    this.assertId(id);
    return this.file.mutate((entries) => {
      if (!Object.hasOwn(entries, id)) return false;
      delete entries[id];
      return true;
    });
  }

  async keys(): Promise<Array<string>> {
    return Object.keys(await this.file.read());
  }

  async values(): Promise<Array<T>> {
    return Object.values(await this.file.read());
  }

  async entries(): Promise<Array<[string, T]>> {
    return Object.entries(await this.file.read());
  }

  async size(): Promise<number> {
    return Object.keys(await this.file.read()).length;
  }

  async clear(): Promise<void> {
    await this.file.replace({});
  }

  private assertId(id: string): void {
    if (id.length === 0) throw new TypeError('Collection entry id cannot be empty.');
    if (UNSAFE_ENTRY_IDS.has(id)) {
      throw new TypeError(`Collection entry id "${id}" is reserved and cannot be used.`);
    }
  }
}
