import type { StorageValidation } from '../types/storage-schema.type';

interface JsonCollectionBaseOptions<T> {
  /** Stable logical name and default file name for the collection. */
  name: string;
  /** Creates fresh initial entries. Defaults to an empty object. */
  defaults?: () => Record<string, T>;
}

export type JsonCollectionOptions<T> = JsonCollectionBaseOptions<T> & StorageValidation<T>;
