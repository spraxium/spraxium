/** Supported argument types for `@PrefixArg.*()` decorators. */
export type PrefixArgType =
  | 'string'
  | 'integer'
  | 'number'
  | 'boolean'
  | 'user'
  | 'channel'
  | 'role'
  | 'member'
  | 'snowflake'
  | 'url'
  | 'duration'
  | 'color'
  | 'emoji'
  | 'rest';

export interface PrefixArgValidation {
  /** Custom regex the raw input must match before coercion. */
  pattern?: RegExp;
  /** Custom validator function. Return `true` to pass or a string error message. */
  validate?: (value: string) => true | string;
}

/**
 * User-facing argument definition returned by a command's `build()` method
 * or a `@PrefixSubcommand()` method. Omits `position` , the framework
 * assigns position from the array index.
 */
export type PrefixArgDefinition = Omit<PrefixArgMetadata, 'position' | 'required'> & {
  required?: boolean;
};

/**
 * Full internal metadata for a single prefix argument.
 * Created by the framework from `PrefixArgDefinition` with an assigned position.
 */
export interface PrefixArgMetadata {
  /** Argument name used for lookup via `@Arg('name')` on the handler. */
  name: string;
  /** Expected type , determines coercion and validation logic. */
  type: PrefixArgType;
  /** Positional index in the raw argv array. */
  position: number;
  /** Whether the argument must be present. @default true */
  required: boolean;
  /** Minimum numeric value (integer/number types). */
  min?: number;
  /** Maximum numeric value (integer/number types). */
  max?: number;
  /** Minimum string length (string type). */
  minLength?: number;
  /** Maximum string length (string type). */
  maxLength?: number;
  /** Allowed literal values (acts as an enum). */
  choices?: Array<string>;
  /** Custom validation rules (regex and/or function). */
  validation?: PrefixArgValidation;
}
