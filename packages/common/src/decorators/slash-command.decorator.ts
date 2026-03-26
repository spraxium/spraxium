import 'reflect-metadata';
import { METADATA_KEYS } from '../constants/metadata-keys.constant';
import type { SlashCommandConfig } from '../interfaces/slash-command-config.interface';

/**
 * Marks a class as a Discord slash command.
 *
 * The decorated class defines the command's schema — its name, description,
 * options, and subcommands. It does **not** contain handler logic; use
 * `@SlashCommandHandler` on a separate class for that.
 *
 * @param config - Command configuration (name, description, permissions, etc.)
 *
 * @example
 * \@SlashCommand({ name: 'ping', description: 'Reply with Pong!' })
 * export class PingCommand {}
 *
 * @example
 * \@SlashCommand({
 *   name: 'admin',
 *   description: 'Admin-only utilities',
 *   defaultMemberPermissions: PermissionFlagsBits.Administrator,
 * })
 * export class AdminCommand {}
 */
export function SlashCommand(config: SlashCommandConfig): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(METADATA_KEYS.SLASH_COMMAND, config, target);
    Reflect.defineMetadata(METADATA_KEYS.INJECTABLE, true, target);
  };
}
