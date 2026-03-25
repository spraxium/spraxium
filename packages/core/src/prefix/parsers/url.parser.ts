import type { PrefixArgMetadata } from '@spraxium/common';
import { ArgumentException } from '../../exceptions/built-in/argument.exception';
import { PREFIX_MESSAGES } from '../constants';

export function parseUrl(raw: string, meta: PrefixArgMetadata): string {
  try {
    new URL(raw);
    return raw;
  } catch {
    throw new ArgumentException({
      argument: meta.name,
      expected: PREFIX_MESSAGES.url,
      received: raw,
    });
  }
}
