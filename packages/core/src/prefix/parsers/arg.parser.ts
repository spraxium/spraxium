import type { PrefixArgMetadata, PrefixArgType } from '@spraxium/common';
import type { Message } from 'discord.js';
import { ArgumentException } from '../../exceptions/built-in/argument.exception';
import { PREFIX_MESSAGES } from '../constants';
import { runValidation } from '../helpers';
import type { ParseFn } from '../types';
import { parseBoolean } from './boolean.parser';
import { parseColor } from './color.parser';
import { parseChannel, parseMember, parseRole, parseSnowflake, parseUser } from './discord.parser';
import { parseDuration } from './duration.parser';
import { parseEmoji } from './emoji.parser';
import { parseInteger } from './integer.parser';
import { parseNumber } from './number.parser';
import { parseString } from './string.parser';
import { parseUrl } from './url.parser';

const PARSER_MAP: Record<PrefixArgType, ParseFn> = {
  string: (raw, meta) => parseString(raw, meta),
  integer: (raw, meta) => parseInteger(raw, meta),
  number: (raw, meta) => parseNumber(raw, meta),
  boolean: (raw, meta) => parseBoolean(raw, meta),
  user: (raw, meta) => parseUser(raw, meta),
  channel: (raw, meta) => parseChannel(raw, meta),
  role: (raw, meta) => parseRole(raw, meta),
  member: (raw, meta) => parseMember(raw, meta),
  snowflake: (raw, meta) => parseSnowflake(raw, meta),
  url: (raw, meta) => parseUrl(raw, meta),
  duration: (raw, meta) => parseDuration(raw, meta),
  color: (raw, meta) => parseColor(raw, meta),
  emoji: (raw, meta) => parseEmoji(raw, meta),
  rest: (raw) => raw,
};

export class PrefixArgParser {
  public parse(
    argv: Array<string>,
    argMetas: Array<PrefixArgMetadata>,
    message: Message,
  ): Map<string, unknown> {
    const result = new Map<string, unknown>();

    for (const meta of argMetas) {
      if (meta.type === 'rest') {
        const rest = argv.slice(meta.position).join(' ');
        if (meta.required && !rest) {
          throw new ArgumentException({
            argument: meta.name,
            expected: PREFIX_MESSAGES.rest,
            received: '',
            usage: '',
          });
        }
        if (rest && meta.maxLength && rest.length > meta.maxLength) {
          throw new ArgumentException({
            argument: meta.name,
            expected: PREFIX_MESSAGES.restMax(meta.maxLength),
            received: `${rest.length} chars`,
          });
        }
        result.set(meta.name, rest || undefined);
        continue;
      }

      const raw = argv[meta.position];

      if (raw === undefined || raw === '') {
        if (meta.required) {
          throw new ArgumentException({
            argument: meta.name,
            expected: meta.type,
            received: 'nothing',
            usage: '',
          });
        }
        result.set(meta.name, undefined);
        continue;
      }

      if (meta.validation) {
        runValidation(raw, meta);
      }

      if (meta.choices && meta.choices.length > 0) {
        if (!meta.choices.includes(raw)) {
          throw new ArgumentException({
            argument: meta.name,
            expected: PREFIX_MESSAGES.choices(meta.choices),
            received: raw,
          });
        }
      }

      const parsed = PARSER_MAP[meta.type](raw, meta, message);
      result.set(meta.name, parsed);
    }

    return result;
  }
}
