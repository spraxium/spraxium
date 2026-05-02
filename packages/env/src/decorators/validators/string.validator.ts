import { MESSAGES } from '../../constants/messages.constant';
import { MetadataHelper } from '../../utils/metadata.util';

/** Validates that the environment variable is a non-empty string. */
export function IsString(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    const meta = MetadataHelper.getOrCreateFieldMeta(target, String(propertyKey));
    meta.rules.push({
      name: 'IsString',
      type: 'string',
      validate: (value) => (typeof value === 'string' ? null : MESSAGES.EXPECTED_STRING),
    });
  };
}

/** Validates that the string value has at least `min` characters. */
export function MinLength(min: number): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    const meta = MetadataHelper.getOrCreateFieldMeta(target, String(propertyKey));
    meta.rules.push({
      name: 'MinLength',
      validate: (value) => {
        if (typeof value !== 'string') return MESSAGES.EXPECTED_STRING;
        if (value.length < min) return MESSAGES.MIN_LENGTH(min, value.length);
        return null;
      },
    });
  };
}

/** Validates that the string value has at most `max` characters. */
export function MaxLength(max: number): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    const meta = MetadataHelper.getOrCreateFieldMeta(target, String(propertyKey));
    meta.rules.push({
      name: 'MaxLength',
      validate: (value) => {
        if (typeof value !== 'string') return MESSAGES.EXPECTED_STRING;
        if (value.length > max) return MESSAGES.MAX_LENGTH(max, value.length);
        return null;
      },
    });
  };
}

/**
 * Validates that the string value matches the given regular expression.
 * @param pattern The pattern to test against.
 * @param message Optional custom failure message.
 */
export function Matches(pattern: RegExp, message?: string): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    const meta = MetadataHelper.getOrCreateFieldMeta(target, String(propertyKey));
    meta.rules.push({
      name: 'Matches',
      validate: (value) => {
        if (typeof value !== 'string') return MESSAGES.EXPECTED_STRING;
        if (!pattern.test(value)) return message ?? MESSAGES.MATCHES(String(pattern), value);
        return null;
      },
    });
  };
}
