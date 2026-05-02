import 'reflect-metadata';
import { ENV_FIELDS_METADATA_KEY } from '../constants/metadata-keys.constant';
import type { EnvFieldMeta } from '../interfaces';

export class MetadataHelper {
  static getOrCreateFieldMeta(target: object, propertyKey: string): EnvFieldMeta {
    const ctor = (target as { constructor: new (...args: Array<unknown>) => unknown }).constructor;

    const fields: Map<string, EnvFieldMeta> =
      Reflect.getOwnMetadata(ENV_FIELDS_METADATA_KEY, ctor) ?? new Map();

    if (!fields.has(propertyKey)) {
      fields.set(propertyKey, {
        envKey: '',
        propertyKey,
        optional: false,
        secret: false,
        rules: [],
      });
    }

    Reflect.defineMetadata(ENV_FIELDS_METADATA_KEY, fields, ctor);
    // biome-ignore lint/style/noNonNullAssertion: field is guaranteed to exist after set above
    return fields.get(propertyKey)!;
  }

  static collectAllFields(target: new (...args: Array<unknown>) => unknown): Map<string, EnvFieldMeta> {
    const result = new Map<string, EnvFieldMeta>();
    let proto: object | null = target;

    while (proto && proto !== Function.prototype) {
      const fields = Reflect.getOwnMetadata(ENV_FIELDS_METADATA_KEY, proto) as
        | Map<string, EnvFieldMeta>
        | undefined;

      if (fields) {
        for (const [key, meta] of fields) {
          if (!result.has(key)) {
            result.set(key, meta);
          }
        }
      }

      proto = Object.getPrototypeOf(proto) as object | null;
    }

    return result;
  }
}
