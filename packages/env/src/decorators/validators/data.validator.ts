import { MESSAGES } from '../../constants/messages.constant';
import type { EnumLike } from '../../types/enum-like.type';
import { MetadataHelper } from '../../utils/metadata.util';

/** Validates that the environment variable is valid JSON and parses it. */
export function IsJson(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    const meta = MetadataHelper.getOrCreateFieldMeta(target, String(propertyKey));
    meta.rules.push({
      name: 'IsJson',
      type: 'json',
      transform: (value) => {
        if (typeof value !== 'string') return value;
        try {
          return JSON.parse(value) as unknown;
        } catch {
          return value;
        }
      },
      validate: (value) => {
        if (typeof value === 'string') {
          try {
            JSON.parse(value);
          } catch {
            return MESSAGES.EXPECTED_VALID_JSON;
          }
        }
        return null;
      },
    });
  };
}

function resolveEnumValues(input: ReadonlyArray<unknown> | EnumLike): Array<unknown> {
  if (Array.isArray(input)) return [...input];
  const values = Object.values(input as EnumLike);
  // Numeric enums produce a reverse mapping ({ A: 0, 0: 'A' }).
  // Keep only the numeric entries as the canonical set of valid values.
  const hasNumeric = values.some((v) => typeof v === 'number');
  return hasNumeric ? values.filter((v) => typeof v === 'number') : values;
}

/**
 * Validates that the environment variable is one of the allowed values.
 *
 * Accepts either an explicit value array or a TypeScript enum object:
 * @example
 * enum LogLevel { Debug = 'debug', Info = 'info', Warn = 'warn' }
 *
 * @IsEnum(LogLevel)
 * logLevel!: LogLevel;
 *
 * @IsEnum(['debug', 'info', 'warn'])
 * logLevel!: string;
 */
export function IsEnum(allowedValues: ReadonlyArray<unknown> | EnumLike): PropertyDecorator {
  const values = resolveEnumValues(allowedValues);
  return (target: object, propertyKey: string | symbol): void => {
    const meta = MetadataHelper.getOrCreateFieldMeta(target, String(propertyKey));
    meta.rules.push({
      name: 'IsEnum',
      validate: (value) => {
        if (!values.includes(value)) {
          return MESSAGES.EXPECTED_ENUM(values.join(', '));
        }
        return null;
      },
    });
  };
}
