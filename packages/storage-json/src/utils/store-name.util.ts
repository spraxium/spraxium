import { StorageError } from '../errors/storage.error';

const STORE_NAME_PATTERN = /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/;

export function assertStoreName(name: string): void {
  if (STORE_NAME_PATTERN.test(name)) return;

  throw new StorageError(
    `Invalid storage name "${name}". Use lowercase letters, numbers, dots, underscores, or hyphens without path segments.`,
    { operation: 'configure', storeName: name },
  );
}
