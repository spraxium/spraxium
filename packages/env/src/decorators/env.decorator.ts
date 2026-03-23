import type { EnvOptions } from '../interfaces/env-options.interface';
import { MetadataHelper } from '../utils/metadata.util';

export type { EnvOptions };

/**
 * Binds a class property to an environment variable.
 * @param envKey The name of the environment variable.
 * @param options Optional configuration for default value and secret masking.
 */
export function Env(envKey: string, options?: EnvOptions): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    const meta = MetadataHelper.getOrCreateFieldMeta(target, String(propertyKey));
    meta.envKey = envKey;
    meta.secret = options?.secret ?? true;
    if (options?.default !== undefined) {
      meta.defaultValue = options.default;
      meta.optional = true;
    }
  };
}