import type { StorageValidation } from '../types/storage-schema.type';

interface JsonDocumentBaseOptions<T> {
  /** Stable logical name and default file name for the document. */
  name: string;
  /** Creates fresh initial data when the file does not exist or reset() is called. */
  defaults: () => T;
}

export type JsonDocumentOptions<T> = JsonDocumentBaseOptions<T> & StorageValidation<T>;
