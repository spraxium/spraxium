import type { PrefixArgMetadata } from '@spraxium/common';
import { ArgumentException } from '../../exceptions/built-in/argument.exception';
import { PREFIX_MESSAGES } from '../constants';

export function checkBounds(value: number, meta: PrefixArgMetadata): void {
  if (meta.min !== undefined && value < meta.min) {
    throw new ArgumentException({
      argument: meta.name,
      expected: PREFIX_MESSAGES.boundsMin(meta.min),
      received: String(value),
    });
  }
  if (meta.max !== undefined && value > meta.max) {
    throw new ArgumentException({
      argument: meta.name,
      expected: PREFIX_MESSAGES.boundsMax(meta.max),
      received: String(value),
    });
  }
}
