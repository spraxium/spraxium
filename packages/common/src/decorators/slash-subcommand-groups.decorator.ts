import 'reflect-metadata';
import { METADATA_KEYS } from '../constants/metadata-keys.constant';

/**
 * Registers one or more `@SlashSubcommandGroup` classes on a `@SlashCommand`.
 *
 * Use this when a command needs to organize subcommands into named groups.
 * Each entry in `groups` must be a class decorated with `@SlashSubcommandGroup`.
 *
 * @param groups - Array of `@SlashSubcommandGroup`-decorated classes.
 *
 * @example
 * \@SlashCommand({ name: 'config', description: 'Bot configuration' })
 * \@SlashSubcommandGroups([SettingsGroup, NotificationsGroup])
 * export class ConfigCommand {}
 */
export function SlashSubcommandGroups(
  groups: Array<new (...args: Array<unknown>) => unknown>,
): ClassDecorator {
  return (target: object): void => {
    Reflect.defineMetadata(METADATA_KEYS.SLASH_SUBCOMMAND_GROUPS, groups, target);
  };
}
