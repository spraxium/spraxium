import 'reflect-metadata';
import { type Constructor, Injectable } from '@spraxium/common';
import { STORAGE_METADATA_KEYS } from '../constants/metadata-keys.constant';
import type { CollectionDefinition } from '../definitions/collection-definition';
import type { JsonCollectionOptions } from '../interfaces/json-collection-options.interface';
import type { StorageDefinitionMetadata } from '../interfaces/storage-definition-metadata.interface';
import { assertStoreName } from '../utils/store-name.util';

export function JsonCollection<T>(options: JsonCollectionOptions<T>) {
  return <C extends Constructor<CollectionDefinition<T>>>(target: C): void => {
    assertStoreName(options.name);
    const metadata: StorageDefinitionMetadata<T> = { kind: 'collection', options };
    Reflect.defineMetadata(STORAGE_METADATA_KEYS.DEFINITION, metadata, target);
    Injectable()(target);
  };
}
