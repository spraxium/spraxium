import 'reflect-metadata';
import { type Constructor, Injectable } from '@spraxium/common';
import { STORAGE_METADATA_KEYS } from '../constants/metadata-keys.constant';
import type { DocumentDefinition } from '../definitions/document-definition';
import type { JsonDocumentOptions } from '../interfaces/json-document-options.interface';
import type { StorageDefinitionMetadata } from '../interfaces/storage-definition-metadata.interface';
import { assertStoreName } from '../utils/store-name.util';

export function JsonDocument<T>(options: JsonDocumentOptions<T>) {
  return <C extends Constructor<DocumentDefinition<T>>>(target: C): void => {
    assertStoreName(options.name);
    const metadata: StorageDefinitionMetadata<T> = { kind: 'document', options };
    Reflect.defineMetadata(STORAGE_METADATA_KEYS.DEFINITION, metadata, target);
    Injectable()(target);
  };
}
