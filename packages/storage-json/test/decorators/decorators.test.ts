import { METADATA_KEYS } from '@spraxium/common';
import { ConfigStore } from '@spraxium/core';
import { describe, expect, expectTypeOf, it } from 'vitest';
import { z } from 'zod';
import {
  CollectionDefinition,
  type CollectionStore,
  DocumentDefinition,
  type DocumentStore,
  JsonCollection,
  JsonDocument,
  STORAGE_METADATA_KEYS,
  StorageError,
  StorageRegistry,
  StorageService,
  defineStorage,
} from '../../src';

interface Value {
  count: number;
}

const ValueSchema = z.object({ count: z.number() });

const isValue = (value: unknown): value is Value =>
  Boolean(value) && typeof value === 'object' && typeof (value as Partial<Value>).count === 'number';

@JsonDocument<Value>({ name: 'typed-document', defaults: () => ({ count: 0 }), validate: isValue })
class TypedDocument extends DocumentDefinition<Value> {}

@JsonCollection<Value>({ name: 'typed-collection', validate: isValue })
class TypedCollection extends CollectionDefinition<Value> {}

@JsonDocument({ name: 'zod-document', defaults: () => ({ count: 0 }), schema: ValueSchema })
class ZodDocument extends DocumentDefinition<z.infer<typeof ValueSchema>> {}

describe('storage decorators', () => {
  it('writes definition and injectable metadata', () => {
    expect(Reflect.getMetadata(METADATA_KEYS.INJECTABLE, TypedDocument)).toBe(true);
    expect(Reflect.getMetadata(STORAGE_METADATA_KEYS.DEFINITION, TypedDocument)).toMatchObject({
      kind: 'document',
      options: { name: 'typed-document' },
    });

    expect(Reflect.getMetadata(METADATA_KEYS.INJECTABLE, TypedCollection)).toBe(true);
    expect(Reflect.getMetadata(STORAGE_METADATA_KEYS.DEFINITION, TypedCollection)).toMatchObject({
      kind: 'collection',
      options: { name: 'typed-collection' },
    });

    expect(Reflect.getMetadata(STORAGE_METADATA_KEYS.DEFINITION, ZodDocument)).toMatchObject({
      kind: 'document',
      options: { name: 'zod-document', schema: ValueSchema },
    });
  });

  it('preserves document and collection item types through StorageService', async () => {
    ConfigStore.load({ plugins: [defineStorage({})] });
    const registry = new StorageRegistry();
    const service = new StorageService(registry);

    expectTypeOf(service.document(TypedDocument)).toEqualTypeOf<DocumentStore<Value>>();
    expectTypeOf(service.collection(TypedCollection)).toEqualTypeOf<CollectionStore<Value>>();
    expectTypeOf(service.document(ZodDocument)).toEqualTypeOf<DocumentStore<Value>>();
    await registry.shutdown();
    ConfigStore.reset();
  });

  it('rejects names that could escape or ambiguously address a file', () => {
    class InvalidDefinition extends DocumentDefinition<Value> {}

    expect(() =>
      JsonDocument<Value>({
        name: '../outside',
        defaults: () => ({ count: 0 }),
        validate: isValue,
      })(InvalidDefinition),
    ).toThrow(StorageError);
  });
});
