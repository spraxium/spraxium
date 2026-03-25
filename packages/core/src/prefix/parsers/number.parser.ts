import type { PrefixArgMetadata } from '@spraxium/common';
import { ArgumentException } from '../../exceptions/built-in/argument.exception';
import { PREFIX_MESSAGES } from '../constants';
import { checkBounds } from '../helpers';

export function parseNumber(raw: string, meta: PrefixArgMetadata): number {
  const value = Number.parseFloat(raw);
  if (Number.isNaN(value)) {
    throw new ArgumentException({ argument: meta.name, expected: PREFIX_MESSAGES.number, received: raw });
  }
  checkBounds(value, meta);
  return value;
}
