import { MESSAGES } from '../../constants/messages.constant';
import { MetadataHelper } from '../../utils/metadata.util';

/** Validates that the environment variable is a valid number and parses it as a float. */
export function IsNumber(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    const meta = MetadataHelper.getOrCreateFieldMeta(target, String(propertyKey));
    meta.rules.push({
      name: 'IsNumber',
      type: 'number',
      transform: (value) => {
        if (typeof value === 'number') return value;
        const raw = String(value);
        const n = Number(raw);
        if (raw.trim() === '' || Number.isNaN(n)) return value;
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
      transform: (value) => {
        if (typeof value === 'number') return value;
        const raw = String(value);
        const n = Number(raw);
        if (raw.trim() === '' || Number.isNaN(n)) return value;
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
      transform: (value) => {
        if (typeof value === 'number') return value;
        const raw = String(value);
        const n = Number(raw);
        if (Number.isNaN(n)) return value;
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

/**
 * Validates that a numeric value is at least `min`.
 * Apply after `@IsNumber()` or `@IsInteger()`.
 */
export function Min(min: number): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    const meta = MetadataHelper.getOrCreateFieldMeta(target, String(propertyKey));
    meta.rules.push({
      name: 'Min',
      validate: (value) => {
        if (typeof value !== 'number') return MESSAGES.EXPECTED_NUMBER(value);
        if (value < min) return MESSAGES.MIN_VALUE(min, value);
        return null;
      },
    });
  };
}

/**
 * Validates that a numeric value is at most `max`.
 * Apply after `@IsNumber()` or `@IsInteger()`.
 */
export function Max(max: number): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    const meta = MetadataHelper.getOrCreateFieldMeta(target, String(propertyKey));
    meta.rules.push({
      name: 'Max',
      validate: (value) => {
        if (typeof value !== 'number') return MESSAGES.EXPECTED_NUMBER(value);
        if (value > max) return MESSAGES.MAX_VALUE(max, value);
        return null;
      },
    });
  };
}

/**
 * Validates that a numeric value is greater than zero.
 * Apply after `@IsNumber()` or `@IsInteger()`.
 */
export function IsPositive(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    const meta = MetadataHelper.getOrCreateFieldMeta(target, String(propertyKey));
    meta.rules.push({
      name: 'IsPositive',
      validate: (value) => {
        if (typeof value !== 'number') return MESSAGES.EXPECTED_NUMBER(value);
        if (value <= 0) return MESSAGES.IS_POSITIVE(value);
        return null;
      },
    });
  };
}

/**
 * Validates that a numeric value is less than zero.
 * Apply after `@IsNumber()` or `@IsInteger()`.
 */
export function IsNegative(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    const meta = MetadataHelper.getOrCreateFieldMeta(target, String(propertyKey));
    meta.rules.push({
      name: 'IsNegative',
      validate: (value) => {
        if (typeof value !== 'number') return MESSAGES.EXPECTED_NUMBER(value);
        if (value >= 0) return MESSAGES.IS_NEGATIVE(value);
        return null;
      },
    });
  };
}
