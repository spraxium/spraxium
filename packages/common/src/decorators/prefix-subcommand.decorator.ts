import 'reflect-metadata';
import { METADATA_KEYS } from '../constants/metadata-keys.constant';
import type { PrefixSubcommandConfig } from '../interfaces/prefix-subcommand-config.interface';

/**
 * Declares a subcommand within a `@PrefixCommand()` class.
 *
 * Stack `@PrefixArg.*()` decorators on the same method to define the
 * argument schema for this specific subcommand. Each subcommand gets its
 * own handler class via `@PrefixCommandHandler(Command, { subcommand: 'name' })`.
 *
 * @example
 * ```ts
 * @PrefixCommand({ name: 'mod', description: 'Moderation commands' })
 * export class ModCommand {
 *   @PrefixSubcommand({ name: 'warn', description: 'Warn a user' })
 *   @PrefixArg.User('target')
 *   @PrefixArg.Rest('reason', { required: false })
 *   warn() {}
 *
 *   @PrefixSubcommand({ name: 'kick', description: 'Kick a user' })
 *   @PrefixArg.User('target')
 *   @PrefixArg.Rest('reason', { required: false })
 *   kick() {}
 * }
 * ```
 */
export function PrefixSubcommand(config: PrefixSubcommandConfig): MethodDecorator {
  return (target, propertyKey, _descriptor) => {
    Reflect.defineMetadata(METADATA_KEYS.PREFIX_SUBCOMMAND, config, target, propertyKey);
  };
}
