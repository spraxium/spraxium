import type { JsonCollectionOptions } from './json-collection-options.interface';
import type { JsonDocumentOptions } from './json-document-options.interface';

export type StorageDefinitionMetadata<T = unknown> =
  | { kind: 'document'; options: JsonDocumentOptions<T> }
  | { kind: 'collection'; options: JsonCollectionOptions<T> };
