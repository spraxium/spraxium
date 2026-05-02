import { MESSAGES } from '../../constants/messages.constant';
import { MetadataHelper } from '../../utils/metadata.util';

/** Marks the field as optional; absent or empty values will not cause a validation error. */
export function IsOptional(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    const meta = MetadataHelper.getOrCreateFieldMeta(target, String(propertyKey));
    meta.optional = true;
  };
}

/** Masks the value in the startup log, regardless of the `@Env()` secret option. */
export function Secret(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    const meta = MetadataHelper.getOrCreateFieldMeta(target, String(propertyKey));
    meta.secret = true;
  };
}

/** Sets a static default value, used when the environment variable is absent. */
export function Default(value: string | number | boolean): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    const meta = MetadataHelper.getOrCreateFieldMeta(target, String(propertyKey));
    meta.defaultValue = String(value);
    meta.optional = true;
  };
}

/** Applies a custom transformation function to the value before validation. */
export function Transform(fn: (value: unknown) => unknown): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    const meta = MetadataHelper.getOrCreateFieldMeta(target, String(propertyKey));
    meta.rules.push({ name: 'Transform', transform: fn });
  };
}

/** Applies a custom validation function; return `true` or a string message on failure. */
export function Validate(fn: (value: unknown) => boolean | string): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    const meta = MetadataHelper.getOrCreateFieldMeta(target, String(propertyKey));
    meta.rules.push({
      name: 'Validate',
      validate: (value) => {
        const result = fn(value);
        if (result === true) return null;
        return typeof result === 'string' ? result : MESSAGES.CUSTOM_VALIDATION_FAILED;
      },
    });
  };
}
