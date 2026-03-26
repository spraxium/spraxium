import 'reflect-metadata';
import { METADATA_KEYS } from '../constants/metadata-keys.constant';
import type { SlashSubcommandGroupMetadata } from '../interfaces/slash-subcommand-metadata.interface';

/**
 * Marks a class as a Discord subcommand group.
 *
 * A subcommand group class contains `@SlashSubcommand`-decorated methods,
 * each representing a subcommand within the group. Register the group on
 * a command class using `@SlashSubcommandGroups`.
 *
 * @param options - Group configuration (name and description).
 *
 * @example
 * \@SlashSubcommandGroup({ name: 'settings', description: 'Bot settings' })
 * export class SettingsGroup {
 *   \@SlashSubcommand({ name: 'view', description: 'View current settings' })
 *   view() {}
 *
 *   \@SlashSubcommand({ name: 'reset', description: 'Reset to defaults' })
 *   reset() {}
 * }
 */
export function SlashSubcommandGroup(options: SlashSubcommandGroupMetadata): ClassDecorator {
  return (target: object): void => {
    Reflect.defineMetadata(METADATA_KEYS.SLASH_SUBCOMMAND_GROUP, options, target);
  };
}
