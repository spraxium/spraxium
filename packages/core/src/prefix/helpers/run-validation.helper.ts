import type { PrefixArgMetadata } from '@spraxium/common';
import { ArgumentException } from '../../exceptions/built-in/argument.exception';
import { PREFIX_MESSAGES } from '../constants';

export function runValidation(raw: string, meta: PrefixArgMetadata): void {
  const v = meta.validation;
  if (!v) return;

  if (v.pattern && !v.pattern.test(raw)) {
    throw new ArgumentException({
      argument: meta.name,
      expected: PREFIX_MESSAGES.patternMatch(v.pattern.source),
      received: raw,
    });
  }

  if (v.validate) {
    const result = v.validate(raw);
    if (result !== true) {
      throw new ArgumentException({
        argument: meta.name,
        expected: result,
        received: raw,
      });
    }
  }
}
