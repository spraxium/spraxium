import type { PrefixArgMetadata } from '@spraxium/common';
import { ArgumentException } from '../../exceptions/built-in/argument.exception';
import { PREFIX_REGEX } from '../constants';

export function parseMention(
  raw: string,
  meta: PrefixArgMetadata,
  mentionRegex: RegExp,
  typeName: string,
): string {
  const match = mentionRegex.exec(raw);
  if (match) return match[1];

  if (PREFIX_REGEX.snowflake.test(raw)) return raw;

  throw new ArgumentException({ argument: meta.name, expected: typeName, received: raw });
}
