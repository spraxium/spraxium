import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ConfigStore } from '@spraxium/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ZodError, z } from 'zod';
import {
  DocumentDefinition,
  JsonDocument,
  StorageError,
  StorageRegistry,
  StorageService,
  defineStorage,
} from '../../src';

const CounterStateSchema = z.object({
  count: z.number(),
  nested: z.object({ enabled: z.boolean() }),
});

type CounterState = z.infer<typeof CounterStateSchema>;

@JsonDocument({
  name: 'counter-state',
  defaults: () => ({ count: 0, nested: { enabled: true } }),
  schema: CounterStateSchema,
})
class CounterDocument extends DocumentDefinition<CounterState> {}

describe('DocumentStore', () => {
  let temporaryDirectory: string;
  let filePath: string;
  let registries: Array<StorageRegistry>;

  beforeEach(async () => {
    temporaryDirectory = await mkdtemp(join(tmpdir(), 'spraxium-storage-document-'));
    filePath = join(temporaryDirectory, 'counter.json');
    registries = [];
  });

  afterEach(async () => {
    await Promise.all(registries.map((registry) => registry.shutdown()));
    ConfigStore.reset();
    await rm(temporaryDirectory, { recursive: true, force: true });
  });

  it('creates defaults during initialization and restores them with reset', async () => {
    const { registry, store } = createRuntime(filePath);
    await expect(store.read()).rejects.toMatchObject({ operation: 'read' });

    await registry.initialize();
    expect(await store.read()).toEqual({ count: 0, nested: { enabled: true } });
    expect(await readFile(filePath, 'utf8')).toBe(
      `${JSON.stringify({ count: 0, nested: { enabled: true } }, null, 2)}\n`,
    );

    await store.replace({ count: 9, nested: { enabled: false } });
    await store.reset();
    expect(await store.read()).toEqual({ count: 0, nested: { enabled: true } });
  });

  it('returns defensive clones and persists data across registry restarts', async () => {
    const first = createRuntime(filePath);
    await first.registry.initialize();
    const snapshot = await first.store.read();
    snapshot.count = 50;
    snapshot.nested.enabled = false;
    expect(await first.store.read()).toEqual({ count: 0, nested: { enabled: true } });

    await first.store.replace({ count: 4, nested: { enabled: false } });
    await first.registry.shutdown();

    const second = createRuntime(filePath);
    await second.registry.initialize();
    expect(await second.store.read()).toEqual({ count: 4, nested: { enabled: false } });
  });

  it('serializes concurrent updates without losing mutations', async () => {
    const { registry, store } = createRuntime(filePath);
    await registry.initialize();

    await Promise.all(
      Array.from({ length: 50 }, () =>
        store.update((draft) => {
          draft.count++;
          return draft.count;
        }),
      ),
    );

    expect((await store.read()).count).toBe(50);
    expect(JSON.parse(await readFile(filePath, 'utf8'))).toMatchObject({ count: 50 });
  });

  it('continues processing after a failed mutator or invalid replacement', async () => {
    const { registry, store } = createRuntime(filePath);
    await registry.initialize();

    await expect(
      store.update(() => {
        throw new Error('domain failure');
      }),
    ).rejects.toThrow('domain failure');
    const invalidWrite = store.replace({ count: 'invalid' } as unknown as CounterState);
    await expect(invalidWrite).rejects.toMatchObject({ operation: 'validate', cause: expect.any(ZodError) });

    await store.update((draft) => {
      draft.count = 2;
    });
    expect((await store.read()).count).toBe(2);
  });

  it('normalizes values with Zod before caching and persisting them', async () => {
    const { registry, store } = createRuntime(filePath);
    await registry.initialize();

    await store.replace({
      count: 3,
      nested: { enabled: false, ignored: true },
      ignored: true,
    } as unknown as CounterState);

    expect(await store.read()).toEqual({ count: 3, nested: { enabled: false } });
    expect(JSON.parse(await readFile(filePath, 'utf8'))).toEqual({
      count: 3,
      nested: { enabled: false },
    });
  });

  it('keeps cached state unchanged and removes temporary files when a write fails', async () => {
    const { registry, store } = createRuntime(filePath);
    await registry.initialize();
    await rm(filePath);
    await mkdir(filePath);

    await expect(store.replace({ count: 10, nested: { enabled: false } })).rejects.toMatchObject({
      operation: 'write',
    });
    expect(await store.read()).toEqual({ count: 0, nested: { enabled: true } });
    expect((await readdir(temporaryDirectory)).filter((name) => name.endsWith('.tmp'))).toEqual([]);
  });

  it('preserves malformed or schema-invalid files when initialization fails', async () => {
    const malformed = '{ not-json';
    await writeFile(filePath, malformed, 'utf8');
    const first = createRuntime(filePath);
    await expect(first.registry.initialize()).rejects.toBeInstanceOf(StorageError);
    expect(await readFile(filePath, 'utf8')).toBe(malformed);
    await first.registry.shutdown();

    const invalidSchema = JSON.stringify({ count: 'nope', nested: { enabled: true } });
    await writeFile(filePath, invalidSchema, 'utf8');
    const second = createRuntime(filePath);
    await expect(second.registry.initialize()).rejects.toMatchObject({ operation: 'validate' });
    expect(await readFile(filePath, 'utf8')).toBe(invalidSchema);
  });

  function createRuntime(path: string) {
    ConfigStore.load({ plugins: [defineStorage({ paths: { 'counter-state': path } })] });
    const registry = new StorageRegistry();
    registries.push(registry);
    const service = new StorageService(registry);
    return { registry, store: service.document(CounterDocument) };
  }
});
