import { MESSAGES } from '../../constants/messages.constant';
import { MetadataHelper } from '../../utils/metadata.util';

/** Validates that the environment variable is a valid number and parses it as a float. */
export function IsNumber(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    const meta = MetadataHelper.getOrCreateFieldMeta(target, String(propertyKey));
    meta.rules.push({
      name: 'IsNumber',
      type: 'number',
      transform: (raw) => {
        const n = Number(raw);
        if (raw.trim() === '' || Number.isNaN(n)) return raw;
        return n;
      },
      validate: (value) =>
        typeof value === 'number' && !Number.isNaN(value) ? null : MESSAGES.EXPECTED_NUMBER(value),
    });
  };
}

/** Validates that the environment variable is a valid integer and parses it. */
export function IsInteger(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    const meta = MetadataHelper.getOrCreateFieldMeta(target, String(propertyKey));
    meta.rules.push({
      name: 'IsInteger',
      type: 'integer',
      transform: (raw) => {
        const n = Number(raw);
        if (raw.trim() === '' || Number.isNaN(n)) return raw;
        return n;
      },
      validate: (value) =>
        typeof value === 'number' && Number.isInteger(value) ? null : MESSAGES.EXPECTED_INTEGER(value),
    });
  };
}

/** Validates that the environment variable is a valid TCP port number (1-65535). */
export function IsPort(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    const meta = MetadataHelper.getOrCreateFieldMeta(target, String(propertyKey));
    meta.rules.push({
      name: 'IsPort',
      type: 'port',
      transform: (raw) => {
        const n = Number(raw);
        if (Number.isNaN(n)) return raw;
        return n;
      },
      validate: (value) => {
        if (typeof value !== 'number' || !Number.isInteger(value)) {
          return MESSAGES.EXPECTED_PORT(value);
        }
        if (value < 1 || value > 65535) {
          return MESSAGES.PORT_RANGE(value);
        }
        return null;
      },
    });
  };
}