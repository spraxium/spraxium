import type { PrefixArgMetadata } from '@spraxium/common';
import { ArgumentException } from '../../exceptions/built-in/argument.exception';
import { PREFIX_MESSAGES, PREFIX_REGEX } from '../constants';
import { parseMention } from '../helpers';

export function parseUser(raw: string, meta: PrefixArgMetadata): string {
  return parseMention(raw, meta, PREFIX_REGEX.userMention, PREFIX_MESSAGES.userMention);
}

export function parseChannel(raw: string, meta: PrefixArgMetadata): string {
  return parseMention(raw, meta, PREFIX_REGEX.channelMention, PREFIX_MESSAGES.channelMention);
}

export function parseRole(raw: string, meta: PrefixArgMetadata): string {
  return parseMention(raw, meta, PREFIX_REGEX.roleMention, PREFIX_MESSAGES.roleMention);
}

export function parseMember(raw: string, meta: PrefixArgMetadata): string {
  return parseMention(raw, meta, PREFIX_REGEX.userMention, PREFIX_MESSAGES.memberMention);
}

export function parseSnowflake(raw: string, meta: PrefixArgMetadata): string {
  if (PREFIX_REGEX.snowflake.test(raw)) return raw;

  throw new ArgumentException({
    argument: meta.name,
    expected: PREFIX_MESSAGES.snowflake,
    received: raw,
  });
}
