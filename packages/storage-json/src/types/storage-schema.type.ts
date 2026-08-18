import type { ZodType } from 'zod';
import type { StorageValidator } from './storage-validator.type';

export type StorageSchema<T> = ZodType<T>;

export type StorageValidation<T> =
  | {
      /** Zod schema used to validate and normalize values. */
      schema: StorageSchema<T>;
      validate?: never;
    }
  | {
      /** @deprecated Prefer schema with a Zod schema for richer validation errors and normalization. */
      validate: StorageValidator<T>;
      schema?: never;
    };
