import 'reflect-metadata';
import { METADATA_KEYS } from '../constants/metadata-keys.constant';
import type { PrefixArgDefinition, PrefixArgType } from '../interfaces/prefix-arg-metadata.interface';
import type { BaseArgConfig } from '../interfaces/prefix-base-arg-config.interface';

function createArgDefinition(
  type: PrefixArgType,
  name: string,
  config: BaseArgConfig = {},
): PrefixArgDefinition {
  return {
    name,
    type,
    required: config.required,
    min: config.min,
    max: config.max,
    minLength: config.minLength,
    maxLength: config.maxLength,
    choices: config.choices,
    validation: config.validation,
  };
}

/**
 * Creates a **method decorator** that appends a `PrefixArgDefinition` to
 * the method's metadata. Multiple decorators stack top-to-bottom.
 *
 * TypeScript applies decorators bottom-up, so we `unshift` each
 * definition to maintain visual (top-to-bottom) positional order.
 */
function argMethodDecorator(type: PrefixArgType, name: string, config: BaseArgConfig = {}): MethodDecorator {
  return (target, propertyKey, _descriptor) => {
    const existing: Array<PrefixArgDefinition> =
      Reflect.getOwnMetadata(METADATA_KEYS.PREFIX_ARG, target, propertyKey) ?? [];
    existing.unshift(createArgDefinition(type, name, config));
    Reflect.defineMetadata(METADATA_KEYS.PREFIX_ARG, existing, target, propertyKey);
  };
}

/**
 * **Parameter decorator** — injects a parsed prefix argument into a handler's
 * `handle()` method parameter by name.
 *
 * @example
 * ```ts
 * @PrefixCommandHandler(BanCommand)
 * export class BanHandler {
 *   handle(@Ctx() msg: Message, @PrefixArg('target') user: string) {}
 * }
 * ```
 */
export function PrefixArg(name: string): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    if (propertyKey === undefined) return;
    const existing: Map<number, string> =
      Reflect.getOwnMetadata(METADATA_KEYS.PREFIX_ARG_PARAM, target, propertyKey) ?? new Map();
    existing.set(parameterIndex, name);
    Reflect.defineMetadata(METADATA_KEYS.PREFIX_ARG_PARAM, existing, target, propertyKey);
  };
}

/**
 * **Method decorators** — declare argument schemas on a command's `build()`
 * method or `@PrefixSubcommand()` methods. Stack top-to-bottom to define
 * positional order.
 *
 * @example
 * ```ts
 * @PrefixCommand({ name: 'roll', cooldown: 3 })
 * export class RollCommand {
 *   @PrefixArg.Integer('sides', { required: false, min: 2, max: 1000 })
 *   @PrefixArg.Integer('count', { required: false, min: 1, max: 25 })
 *   build() {}
 * }
 *
 * @PrefixCommand({ name: 'mod' })
 * export class ModCommand {
 *   @PrefixSubcommand({ name: 'ban', description: 'Ban a user' })
 *   @PrefixArg.User('target')
 *   @PrefixArg.Rest('reason', { required: false })
 *   ban() {}
 * }
 * ```
 */
export namespace PrefixArg {
  /** String argument. */
  // biome-ignore lint/suspicious/noShadowRestrictedNames: Intentional API — PrefixArg.String mirrors the type name
  export function String(name: string, config?: BaseArgConfig): MethodDecorator {
    return argMethodDecorator('string', name, config);
  }

  /** Integer argument (rounded). */
  export function Integer(name: string, config?: BaseArgConfig): MethodDecorator {
    return argMethodDecorator('integer', name, config);
  }

  /** Floating-point number argument. */
  // biome-ignore lint/suspicious/noShadowRestrictedNames: Intentional API — PrefixArg.Number mirrors the type name
  export function Number(name: string, config?: BaseArgConfig): MethodDecorator {
    return argMethodDecorator('number', name, config);
  }

  /** Boolean argument (`true`/`false`/`yes`/`no`/`1`/`0`). */
  // biome-ignore lint/suspicious/noShadowRestrictedNames: Intentional API — PrefixArg.Boolean mirrors the type name
  export function Boolean(name: string, config?: BaseArgConfig): MethodDecorator {
    return argMethodDecorator('boolean', name, config);
  }

  /** Discord user mention (parses `<@id>` or raw snowflake). */
  export function User(name: string, config?: BaseArgConfig): MethodDecorator {
    return argMethodDecorator('user', name, config);
  }

  /** Discord channel mention (parses `<#id>` or raw snowflake). */
  export function Channel(name: string, config?: BaseArgConfig): MethodDecorator {
    return argMethodDecorator('channel', name, config);
  }

  /** Discord role mention (parses `<@&id>` or raw snowflake). */
  export function Role(name: string, config?: BaseArgConfig): MethodDecorator {
    return argMethodDecorator('role', name, config);
  }

  /** Discord guild member (fetched from mention or snowflake). */
  export function Member(name: string, config?: BaseArgConfig): MethodDecorator {
    return argMethodDecorator('member', name, config);
  }

  /** Raw Discord snowflake ID (17-20 digit number). */
  export function Snowflake(name: string, config?: BaseArgConfig): MethodDecorator {
    return argMethodDecorator('snowflake', name, config);
  }

  /** Validated URL string. */
  export function Url(name: string, config?: BaseArgConfig): MethodDecorator {
    return argMethodDecorator('url', name, config);
  }

  /** Time duration (e.g. `5m`, `1h30m`, `2d`). Coerced to milliseconds. */
  export function Duration(name: string, config?: BaseArgConfig): MethodDecorator {
    return argMethodDecorator('duration', name, config);
  }

  /** Hex color code (e.g. `#FF0000` or `FF0000`). Coerced to number. */
  export function Color(name: string, config?: BaseArgConfig): MethodDecorator {
    return argMethodDecorator('color', name, config);
  }

  /** Discord emoji (custom `<:name:id>` or unicode). */
  export function Emoji(name: string, config?: BaseArgConfig): MethodDecorator {
    return argMethodDecorator('emoji', name, config);
  }

  /** Variadic rest — all remaining tokens joined into a single string. */
  export function Rest(name: string, config?: BaseArgConfig): MethodDecorator {
    return argMethodDecorator('rest', name, config);
  }
}
