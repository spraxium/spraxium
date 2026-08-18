import type { StorageOperation } from '../types/storage-operation.type';

export interface StorageErrorContext {
  operation: StorageOperation;
  storeName?: string;
  filePath?: string;
  cause?: unknown;
}

export class StorageError extends Error {
  readonly operation: StorageOperation;
  readonly storeName?: string;
  readonly filePath?: string;

  constructor(message: string, context: StorageErrorContext) {
    super(message, context.cause === undefined ? undefined : { cause: context.cause });
    this.name = 'StorageError';
    this.operation = context.operation;
    this.storeName = context.storeName;
    this.filePath = context.filePath;
  }
}
