import type { EnvFieldType } from '../types/env-field.type';

export interface ValidationRule {
  name: string;
  type?: EnvFieldType;
  transform?: (value: unknown) => unknown;
  validate?: (value: unknown) => string | null;
}

export interface EnvFieldMeta {
  envKey: string;
  propertyKey: string;
  optional: boolean;
  secret: boolean;
  defaultValue?: string;
  rules: Array<ValidationRule>;
}
