import type { PrefixArgMetadata } from '@spraxium/common';
import { ArgumentException } from '../../exceptions/built-in/argument.exception';
import { PREFIX_MESSAGES, PREFIX_REGEX } from '../constants';

export function parseColor(raw: string, meta: PrefixArgMetadata): number {
  const match = PREFIX_REGEX.hexColor.exec(raw);
  if (!match) {
    throw new ArgumentException({
      argument: meta.name,
      expected: PREFIX_MESSAGES.color,
      received: raw,
    });
  }
  return Number.parseInt(match[1], 16);
}
