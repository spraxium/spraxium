import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ConfigStore } from '@spraxium/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  CollectionDefinition,
  JsonCollection,
  StorageRegistry,
  StorageService,
  defineStorage,
} from '../../src';

const EntrySchema = z.object({
  value: z.number(),
  tags: z.array(z.string()),
});

type Entry = z.infer<typeof EntrySchema>;

@JsonCollection({
  name: 'entries',
  defaults: () => ({ seed: { value: 1, tags: ['default'] } }),
  schema: EntrySchema,
})
class EntriesCollection extends CollectionDefinition<Entry> {}

describe('CollectionStore', () => {
  let temporaryDirectory: string;
  let filePath: string;
  let registry: StorageRegistry;

  beforeEach(async () => {
    temporaryDirectory = await mkdtemp(join(tmpdir(), 'spraxium-storage-collection-'));
    filePath = join(temporaryDirectory, 'entries.json');
    ConfigStore.load({ plugins: [defineStorage({ paths: { entries: filePath } })] });
    registry = new StorageRegistry();
  });

  afterEach(async () => {
    await registry.shutdown();
    ConfigStore.reset();
    await rm(temporaryDirectory, { recursive: true, force: true });
  });

  it('supports CRUD, enumeration, size, and clear', async () => {
    const store = new StorageService(registry).collection(EntriesCollection);
    await registry.initialize();

    expect(await store.get('seed')).toEqual({ value: 1, tags: ['default'] });
    expect(await store.has('missing')).toBe(false);
    await store.set('second', { value: 2, tags: [] });
    expect(await store.has('second')).toBe(true);
    expect(await store.size()).toBe(2);
    expect(await store.keys()).toEqual(['seed', 'second']);
    expect(await store.values()).toHaveLength(2);
    expect(await store.entries()).toEqual([
      ['seed', { value: 1, tags: ['default'] }],
      ['second', { value: 2, tags: [] }],
    ]);
    expect(await store.delete('second')).toBe(true);
    expect(await store.delete('second')).toBe(false);

    await store.clear();
    expect(await store.size()).toBe(0);
    expect(JSON.parse(await readFile(filePath, 'utf8'))).toEqual({});
  });

  it('updates one entry atomically and returns defensive values', async () => {
    const store = new StorageService(registry).collection(EntriesCollection);
    await registry.initialize();

    await Promise.all(
      Array.from({ length: 30 }, () =>
        store.update('counter', (current) => ({ value: (current?.value ?? 0) + 1, tags: [] })),
      ),
    );
    expect((await store.get('counter'))?.value).toBe(30);

    const entry = await store.get('counter');
    if (!entry) throw new Error('counter entry missing');
    entry.value = 100;
    expect((await store.get('counter'))?.value).toBe(30);
  });

  it('rejects empty ids and invalid entry values without mutating the file', async () => {
    const store = new StorageService(registry).collection(EntriesCollection);
    await registry.initialize();
    const before = await readFile(filePath, 'utf8');

    await expect(store.set('', { value: 1, tags: [] })).rejects.toThrow(TypeError);
    await expect(store.set('__proto__', { value: 1, tags: [] })).rejects.toThrow('reserved');
    await expect(store.set('invalid', { value: 1, tags: [1] } as unknown as Entry)).rejects.toMatchObject({
      operation: 'validate',
    });
    expect(await readFile(filePath, 'utf8')).toBe(before);
  });

  it('applies the item schema to every collection entry', async () => {
    const store = new StorageService(registry).collection(EntriesCollection);
    await registry.initialize();

    await store.set('normalized', { value: 2, tags: [], ignored: true } as unknown as Entry);

    expect(await store.get('normalized')).toEqual({ value: 2, tags: [] });
    expect(JSON.parse(await readFile(filePath, 'utf8'))).toMatchObject({
      normalized: { value: 2, tags: [] },
    });
  });
});
