import type { EnvFieldMeta } from '../interfaces/env-field.interface';
import type { FieldValidationResult } from '../interfaces/field-validation-result.interface';
import { EnvFieldError } from './validation.error';

export class FieldValidator {
  static validate(meta: EnvFieldMeta): FieldValidationResult {
    const rawFromEnv = process.env[meta.envKey];
    const raw = rawFromEnv !== undefined ? rawFromEnv : meta.defaultValue;
    const source: FieldValidationResult['source'] =
      rawFromEnv !== undefined ? 'env' : raw !== undefined ? 'default' : 'absent';

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
      if (rule.transform) {
        try {
          parsed = rule.transform(raw);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          return {
            meta,
            raw,
            parsed: undefined,
            error: new EnvFieldError(meta.envKey, 'invalid_value', meta.secret, raw, msg),
            source,
          };
        }
        break;
      }
    }

    for (const rule of meta.rules) {
      if (!rule.validate) continue;
      const errorMsg = rule.validate(parsed);
      if (errorMsg !== null) {
        return {
          meta,
          raw,
          parsed: undefined,
          error: new EnvFieldError(meta.envKey, 'invalid_value', meta.secret, raw, errorMsg),
          source,
        };
      }
    }

    return { meta, raw, parsed, error: null, source };
  }
}
