import { MESSAGES } from '../../constants/messages.constant';
import { MetadataHelper } from '../../utils/metadata.util';

/** Validates that the environment variable is valid JSON and parses it. */
export function IsJson(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    const meta = MetadataHelper.getOrCreateFieldMeta(target, String(propertyKey));
    meta.rules.push({
      name: 'IsJson',
      type: 'json',
      transform: (raw) => {
        try {
          return JSON.parse(raw) as unknown;
        } catch {
          return raw;
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

/** Validates that the environment variable is one of the allowed enum values. */
export function IsEnum(allowedValues: Array<unknown>): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    const meta = MetadataHelper.getOrCreateFieldMeta(target, String(propertyKey));
    meta.rules.push({
      name: 'IsEnum',
      validate: (value) => {
        if (!allowedValues.includes(value)) {
          return MESSAGES.EXPECTED_ENUM(allowedValues.join(', '));
        }
        return null;
      },
    });
  };
}
