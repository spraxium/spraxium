import type { PrefixArgValidation } from './prefix-arg-metadata.interface';

export interface BaseArgConfig {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  choices?: Array<string>;
  validation?: PrefixArgValidation;
}
