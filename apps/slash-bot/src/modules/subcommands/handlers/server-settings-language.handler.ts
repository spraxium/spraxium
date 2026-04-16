import { Ctx, SlashCommandHandler, SlashOpt } from '@spraxium/common';
import type { ChatInputCommandInteraction } from 'discord.js';
import { ServerCommand } from '../commands/server.command';

// Handler for /server settings language — subcommand inside the "settings" group.
@SlashCommandHandler(ServerCommand, { sub: 'language', group: 'settings' })
export class ServerSettingsLanguageHandler {
  async handle(
    @Ctx() interaction: ChatInputCommandInteraction,
    @SlashOpt('locale') locale: string,
  ): Promise<void> {
    await interaction.reply(`🌐 Server language updated to \`${locale}\`.`);
  }
}
