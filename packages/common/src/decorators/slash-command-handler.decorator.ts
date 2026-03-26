import 'reflect-metadata';
import { METADATA_KEYS } from '../constants/metadata-keys.constant';
import type { SlashCommandHandlerMetadata } from '../interfaces/slash-command-handler-metadata.interface';

/**
 * Marks a class as the execution handler for a slash command.
 *
 * The handler class must implement a `build()` method (or a method matching
 * the corresponding subcommand/group) that receives the interaction and
 * performs the business logic.
 *
 * @param command - The `@SlashCommand`-decorated class this handler belongs to.
 * @param options - Optional routing options for subcommand or group targeting.
 * @param options.sub - The subcommand name this handler responds to.
 * @param options.group - The subcommand group name this handler responds to.
 *
 * @example
 * // Handler for the root command
 * \@SlashCommandHandler(PingCommand)
 * export class PingHandler {
 *   async build(interaction: ChatInputCommandInteraction) {
 *     await interaction.reply('Pong!');
 *   }
 * }
 *
 * @example
 * // Handler for a specific subcommand
 * \@SlashCommandHandler(AdminCommand, { sub: 'ban' })
 * export class AdminBanHandler {
 *   async build(interaction: ChatInputCommandInteraction) { ... }
 * }
 */
export function SlashCommandHandler(
  command: new () => object,
  options?: { sub?: string; group?: string },
): ClassDecorator {
  return (target) => {
    const meta: SlashCommandHandlerMetadata = {
      command,
      sub: options?.sub,
      group: options?.group,
    };
    Reflect.defineMetadata(METADATA_KEYS.SLASH_COMMAND_HANDLER, meta, target);
    Reflect.defineMetadata(METADATA_KEYS.INJECTABLE, true, target);
  };
}
