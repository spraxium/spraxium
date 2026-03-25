import type { EnvFieldError } from '../validator/validation.error';
import type { EnvFieldMeta } from './env-field.interface';

export interface FieldValidationResult {
  meta: EnvFieldMeta;
  raw: string | undefined;
  parsed: unknown;
  error: EnvFieldError | null;
  source: 'env' | 'default' | 'absent';
}
