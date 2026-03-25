import type { PrefixArgMetadata } from '@spraxium/common';
import { ArgumentException } from '../../exceptions/built-in/argument.exception';
import { PREFIX_MESSAGES } from '../constants';

export function parseString(raw: string, meta: PrefixArgMetadata): string {
  if (meta.minLength !== undefined && raw.length < meta.minLength) {
    throw new ArgumentException({
      argument: meta.name,
      expected: PREFIX_MESSAGES.stringMin(meta.minLength),
      received: `${raw.length} characters`,
    });
  }
  if (meta.maxLength !== undefined && raw.length > meta.maxLength) {
    throw new ArgumentException({
      argument: meta.name,
      expected: PREFIX_MESSAGES.stringMax(meta.maxLength),
      received: `${raw.length} characters`,
    });
  }
  return raw;
}
