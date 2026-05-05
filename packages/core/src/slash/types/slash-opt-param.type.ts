import type { SlashOptionType } from '@spraxium/common';

/**
 * A single entry stored in `SLASH_OPT_PARAM` metadata; maps a parameter
 * index to its option name and, when set by a typed decorator such as
 * `@SlashStringOption`, its known Discord option type.
 *
 * When `type` is present the invoker uses it directly, bypassing the
 * command-class metadata lookup (`resolveOptionsFromCommand`).
 */
export type SlashOptParam = {
  index: number;
  name: string;
  /** Set by specialized decorators like `@SlashStringOption`; omitted for the generic `@SlashOption`/`@SlashOpt`. */
  type?: SlashOptionType;
};
