import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ConfigStore, ModuleLoader } from '@spraxium/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  CollectionDefinition,
  DocumentDefinition,
  JsonCollection,
  JsonDocument,
  StorageError,
  StorageRegistry,
  StorageService,
  defineStorage,
} from '../../src';

interface Value {
  value: string;
}

const isValue = (value: unknown): value is Value =>
  Boolean(value) && typeof value === 'object' && typeof (value as Partial<Value>).value === 'string';

@JsonDocument<Value>({ name: 'discovered', defaults: () => ({ value: 'ok' }), validate: isValue })
class DiscoveredDocument extends DocumentDefinition<Value> {}

@JsonDocument<Value>({ name: 'duplicate', defaults: () => ({ value: 'one' }), validate: isValue })
class FirstDuplicate extends DocumentDefinition<Value> {}

@JsonCollection<Value>({ name: 'duplicate', validate: isValue })
class SecondDuplicate extends CollectionDefinition<Value> {}

describe('StorageRegistry', () => {
  let temporaryDirectory: string;
  let registries: Array<StorageRegistry>;

  beforeEach(async () => {
    temporaryDirectory = await mkdtemp(join(tmpdir(), 'spraxium-storage-registry-'));
    ConfigStore.load({ plugins: [defineStorage({ directory: temporaryDirectory })] });
    registries = [];
  });

  afterEach(async () => {
    await Promise.all(registries.map((registry) => registry.shutdown()));
    ConfigStore.reset();
    await rm(temporaryDirectory, { recursive: true, force: true });
  });

  it('discovers decorated provider instances through ModuleLoader scanners', async () => {
    const initialScannerCount = ModuleLoader.instanceScanners.size;
    const registry = track(new StorageRegistry());
    expect(ModuleLoader.instanceScanners.size).toBe(initialScannerCount + 1);

    for (const scanner of ModuleLoader.instanceScanners) scanner(new DiscoveredDocument());
    expect(registry.registered()).toEqual(['discovered']);
    await registry.initialize();

    await registry.shutdown();
    expect(ModuleLoader.instanceScanners.size).toBe(initialScannerCount);
  });

  it('rejects duplicate names and access through the wrong store kind', async () => {
    const registry = track(new StorageRegistry());
    const service = new StorageService(registry);
    service.document(FirstDuplicate);

    expect(() => service.collection(SecondDuplicate)).toThrow(StorageError);
    expect(() =>
      service.collection(FirstDuplicate as unknown as new () => CollectionDefinition<Value>),
    ).toThrow('not a collection');
  });

  it('rejects undecorated definition tokens', () => {
    class Undecorated extends DocumentDefinition<Value> {}
    const registry = track(new StorageRegistry());
    const service = new StorageService(registry);
    expect(() => service.document(Undecorated)).toThrow('missing @JsonDocument()');
  });

  function track<T extends StorageRegistry>(registry: T): T {
    registries.push(registry);
    return registry;
  }
});
