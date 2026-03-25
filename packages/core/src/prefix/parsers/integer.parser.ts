import type { PrefixArgMetadata } from '@spraxium/common';
import { ArgumentException } from '../../exceptions/built-in/argument.exception';
import { PREFIX_MESSAGES } from '../constants';
import { checkBounds } from '../helpers';

export function parseInteger(raw: string, meta: PrefixArgMetadata): number {
  const value = Number.parseInt(raw, 10);
  if (Number.isNaN(value)) {
    throw new ArgumentException({ argument: meta.name, expected: PREFIX_MESSAGES.integer, received: raw });
  }
  checkBounds(value, meta);
  return value;
}
