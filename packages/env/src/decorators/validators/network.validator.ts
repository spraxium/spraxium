import { MESSAGES } from '../../constants/messages.constant';
import { MetadataHelper } from '../../utils/metadata.util';

/** Validates that the environment variable is a valid URL. */
export function IsUrl(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    const meta = MetadataHelper.getOrCreateFieldMeta(target, String(propertyKey));
    meta.rules.push({
      name: 'IsUrl',
      type: 'url',
      validate: (value) => {
        if (typeof value !== 'string') return MESSAGES.EXPECTED_STRING;
        try {
          new URL(value);
          return null;
        } catch {
          return MESSAGES.EXPECTED_URL(value);
        }
      },
    });
  };
}

/** Validates that the environment variable is a valid email address. */
export function IsEmail(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    const meta = MetadataHelper.getOrCreateFieldMeta(target, String(propertyKey));
    meta.rules.push({
      name: 'IsEmail',
      type: 'email',
      validate: (value) => {
        if (typeof value !== 'string') return MESSAGES.EXPECTED_STRING;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return MESSAGES.EXPECTED_EMAIL(value);
        }
        return null;
      },
    });
  };
}

/** Validates that the environment variable is a valid hostname or IP address. */
export function IsHost(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    const meta = MetadataHelper.getOrCreateFieldMeta(target, String(propertyKey));
    meta.rules.push({
      name: 'IsHost',
      type: 'host',
      validate: (value) => {
        if (typeof value !== 'string' || !value.trim()) {
          return MESSAGES.EXPECTED_HOST;
        }
        const trimmed = value.trim();
        if (/^\d{1,3}(\.\d{1,3}){3}$/.test(trimmed)) return null;
        if (/^\[?[0-9a-fA-F:]+\]?$/.test(trimmed)) return null;
        if (
          /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/.test(trimmed)
        ) {
          return null;
        }
        return MESSAGES.EXPECTED_HOST_INVALID(value);
      },
    });
  };
}

/** Validates that the environment variable is a valid MongoDB connection URI. */
export function IsMongoUri(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    const meta = MetadataHelper.getOrCreateFieldMeta(target, String(propertyKey));
    meta.rules.push({
      name: 'IsMongoUri',
      type: 'mongodb-uri',
      validate: (value) => {
        if (typeof value !== 'string') return MESSAGES.EXPECTED_STRING;
        if (!value.startsWith('mongodb://') && !value.startsWith('mongodb+srv://')) {
          return MESSAGES.EXPECTED_MONGO_URI;
        }
        return null;
      },
    });
  };
}

/** Validates that the environment variable is a valid Redis connection URI. */
export function IsRedisUri(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    const meta = MetadataHelper.getOrCreateFieldMeta(target, String(propertyKey));
    meta.rules.push({
      name: 'IsRedisUri',
      type: 'redis-uri',
      validate: (value) => {
        if (typeof value !== 'string') return MESSAGES.EXPECTED_STRING;
        if (!value.startsWith('redis://') && !value.startsWith('rediss://')) {
          return MESSAGES.EXPECTED_REDIS_URI;
        }
        return null;
      },
    });
  };
}
