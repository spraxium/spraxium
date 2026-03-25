import type { PrefixArgMetadata } from '@spraxium/common';
import { ArgumentException } from '../../exceptions/built-in/argument.exception';
import { PREFIX_CONSTANTS, PREFIX_MESSAGES } from '../constants';

export function parseBoolean(raw: string, meta: PrefixArgMetadata): boolean {
  const lower = raw.toLowerCase();
  if (PREFIX_CONSTANTS.booleanTruthy.includes(lower)) return true;
  if (PREFIX_CONSTANTS.booleanFalsy.includes(lower)) return false;

  throw new ArgumentException({
    argument: meta.name,
    expected: PREFIX_MESSAGES.boolean,
    received: raw,
  });
}
