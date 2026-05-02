import type { EnvFieldMeta, FieldValidationResult } from '../interfaces';
import { EnvFieldError } from './validation.error';

export class FieldValidator {
  static validate(meta: EnvFieldMeta): FieldValidationResult {
    const rawFromEnv = process.env[meta.envKey];
    const raw = rawFromEnv !== undefined ? rawFromEnv : meta.defaultValue;
    const source: FieldValidationResult['source'] =
      rawFromEnv !== undefined ? 'env' : raw !== undefined ? 'default' : 'absent';

    // Never expose a plaintext secret through the raw field — callers see undefined.
    const exposedRaw = meta.secret ? undefined : raw;

    if (raw === undefined) {
      if (meta.optional) {
        return { meta, raw: undefined, parsed: undefined, error: null, source };
      }
      return {
        meta,
        raw: undefined,
        parsed: undefined,
        error: new EnvFieldError(meta.envKey, 'missing', meta.secret),
        source,
      };
    }

    let parsed: unknown = raw;

    for (const rule of meta.rules) {
      if (!rule.transform) continue;
      try {
        parsed = rule.transform(parsed);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
          meta,
          raw: exposedRaw,
          parsed: undefined,
          // received is omitted for secret fields so the plaintext never leaks into the error object
          error: new EnvFieldError(meta.envKey, 'invalid_value', meta.secret, exposedRaw, msg),
          source,
        };
      }
    }

    for (const rule of meta.rules) {
      if (!rule.validate) continue;
      const errorMsg = rule.validate(parsed);
      if (errorMsg !== null) {
        return {
          meta,
          raw: exposedRaw,
          parsed: undefined,
          error: new EnvFieldError(meta.envKey, 'invalid_value', meta.secret, exposedRaw, errorMsg),
          source,
        };
      }
    }

    return { meta, raw: exposedRaw, parsed, error: null, source };
  }
}
