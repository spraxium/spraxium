import type { StorageParser } from '../types/storage-parser.type';
import type { StorageValidation } from '../types/storage-schema.type';

export function createStorageParser<T>(validation: StorageValidation<T>): StorageParser<T> {
  if (validation.schema) {
    return (value) => {
      const result = validation.schema.safeParse(value);
      if (!result.success) throw result.error;
      return result.data;
    };
  }

  return (value) => {
    if (!validation.validate(value)) throw new TypeError('Custom storage validator rejected the value.');
    return value;
  };
}
