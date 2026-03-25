import type { PrefixArgMetadata } from '@spraxium/common';
import { ArgumentException } from '../../exceptions/built-in/argument.exception';
import { PREFIX_MESSAGES, PREFIX_REGEX } from '../constants';
import { isUnicodeEmoji } from '../helpers';
import type { ParsedEmoji } from '../interfaces';

export type { ParsedEmoji } from '../interfaces';

export function parseEmoji(raw: string, meta: PrefixArgMetadata): ParsedEmoji {
  const customMatch = PREFIX_REGEX.customEmoji.exec(raw);
  if (customMatch) {
    return {
      name: customMatch[1],
      id: customMatch[2],
      animated: raw.startsWith('<a:'),
    };
  }

  if (isUnicodeEmoji(raw)) {
    return { name: raw, id: null, animated: false };
  }

  throw new ArgumentException({
    argument: meta.name,
    expected: PREFIX_MESSAGES.emoji,
    received: raw,
  });
}
