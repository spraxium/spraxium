import type { PrefixArgMetadata } from '@spraxium/common';
import { ArgumentException } from '../../exceptions/built-in/argument.exception';
import { PREFIX_CONSTANTS, PREFIX_MESSAGES, PREFIX_REGEX } from '../constants';

export function parseDuration(raw: string, meta: PrefixArgMetadata): number {
  const parts = raw.match(PREFIX_REGEX.durationSegment);
  if (!parts || parts.length === 0) {
    throw new ArgumentException({
      argument: meta.name,
      expected: PREFIX_MESSAGES.duration,
      received: raw,
    });
  }

  let total = 0;
  for (const part of parts) {
    const match = PREFIX_REGEX.durationUnit.exec(part.trim());
    if (!match) {
      throw new ArgumentException({
        argument: meta.name,
        expected: PREFIX_MESSAGES.duration,
        received: raw,
      });
    }
    const value = Number.parseInt(match[1], 10);
    const unit = match[2].toLowerCase();
    total += value * PREFIX_CONSTANTS.durationMultipliers[unit];
  }

  return total;
}
