import 'reflect-metadata';
import { METADATA_KEYS } from '../constants/metadata-keys.constant';
import type { PrefixCommandConfig } from '../interfaces/prefix-command-config.interface';

/**
 * Marks a class as a prefix command **definition** (structure only).
 *
 * The class itself holds no execution logic — it is a metadata container
 * that declares the command name, aliases, and argument schema.
 *
 * **Simple commands** — stack `@PrefixArg.*()` decorators on a `build()` method.
 * **Subcommand commands** — use `@PrefixSubcommand()` + `@PrefixArg.*()` on methods.
 *
 * Execution logic belongs in a separate `@PrefixCommandHandler()` class.
 *
 * Register in a module's `commands: []` array.
 *
 * @example
 * ```ts
 * @PrefixCommand({ name: 'ban', aliases: ['b'], description: 'Ban a user' })
 * export class BanCommand {
 *   @PrefixArg.User('target')
 *   @PrefixArg.String('reason', { required: false })
 *   build() {}
 * }
 * ```
 */
export function PrefixCommand(config: PrefixCommandConfig): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(METADATA_KEYS.PREFIX_COMMAND, config, target);
    Reflect.defineMetadata(METADATA_KEYS.INJECTABLE, true, target);
  };
}
