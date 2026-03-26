import 'reflect-metadata';
import { METADATA_KEYS } from '../constants/metadata-keys.constant';
import type { SlashSubcommandMetadata } from '../interfaces/slash-subcommand-metadata.interface';

/**
 * Marks a method on a `@SlashCommand` class as a subcommand.
 *
 * Each decorated method becomes a Discord subcommand. The method name is used
 * to match the corresponding `@SlashCommandHandler` via its `sub` option.
 * Attach `@SlashOption.*` decorators to the same method to define the
 * subcommand's options.
 *
 * @param options - Subcommand configuration (name and description).
 *
 * @example
 * \@SlashCommand({ name: 'user', description: 'User utilities' })
 * export class UserCommand {
 *   \@SlashSubcommand({ name: 'info', description: 'Show user info' })
 *   \@SlashOption.User('target', { description: 'The user', required: true })
 *   info() {}
 *
 *   \@SlashSubcommand({ name: 'avatar', description: 'Show avatar' })
 *   avatar() {}
 * }
 */
export function SlashSubcommand(options: SlashSubcommandMetadata): MethodDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    Reflect.defineMetadata(METADATA_KEYS.SLASH_SUBCOMMAND, options, target, propertyKey);

    const existing: Array<{ method: string | symbol; meta: SlashSubcommandMetadata }> =
      Reflect.getMetadata(METADATA_KEYS.SLASH_SUBCOMMANDS_LIST, target.constructor) ?? [];

    Reflect.defineMetadata(
      METADATA_KEYS.SLASH_SUBCOMMANDS_LIST,
      [...existing, { method: propertyKey, meta: options }],
      target.constructor,
    );
  };
}
