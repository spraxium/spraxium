import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ConfigStore } from '@spraxium/core';
import { StorageRegistry, StorageService, defineStorage } from '@spraxium/storage-json';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { StorageDemoService } from '../src/modules/storage-demo/services/storage-demo.service';

describe(StorageDemoService.name, () => {
  let temporaryDirectory: string;
  let registries: Array<StorageRegistry>;

  beforeEach(async () => {
    temporaryDirectory = await mkdtemp(join(tmpdir(), 'spraxium-storage-bot-'));
    ConfigStore.load({ plugins: [defineStorage({ directory: temporaryDirectory })] });
    registries = [];
  });

  afterEach(async () => {
    await Promise.all(registries.map((registry) => registry.shutdown()));
    ConfigStore.reset();
    await rm(temporaryDirectory, { recursive: true, force: true });
  });

  it('demonstrates document and collection operations through the domain service', async () => {
    const { registry, demo } = createRuntime();
    await registry.initialize();
    await demo.onBoot();

    const initial = await demo.snapshot();
    expect(initial.stats).toMatchObject({ version: 1, bootCount: 1, commandCount: 1 });
    expect(initial.noteCount).toBe(2);

    expect((await demo.saveNote('guide', 'First version')).created).toBe(true);
    expect((await demo.saveNote('guide', 'Updated version')).created).toBe(false);
    expect(await demo.readNote('guide')).toMatchObject({ content: 'Updated version', reads: 1 });
    expect((await demo.listNotes()).map(([id]) => id)).toContain('guide');
    expect(await demo.removeNote('guide')).toBe(true);
    expect(await demo.removeNote('guide')).toBe(false);

    await demo.reset();
    expect(await demo.listNotes()).toEqual([]);
    expect((await demo.snapshot()).stats.bootCount).toBe(0);
  });

  it('loads data written by a previous runtime', async () => {
    const first = createRuntime();
    await first.registry.initialize();
    await first.demo.onBoot();
    await first.demo.saveNote('persistent', 'Survives restart');
    await first.registry.shutdown();

    const second = createRuntime();
    await second.registry.initialize();
    await second.demo.onBoot();

    expect(await second.demo.readNote('persistent')).toMatchObject({ content: 'Survives restart' });
    expect((await second.demo.snapshot()).stats.bootCount).toBe(2);
  });

  function createRuntime(): { registry: StorageRegistry; demo: StorageDemoService } {
    const registry = new StorageRegistry();
    registries.push(registry);
    const demo = new StorageDemoService(new StorageService(registry));
    return { registry, demo };
  }
});
