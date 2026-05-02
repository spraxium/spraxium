import { Ctx, SlashCommandHandler, SlashStringOption } from '@spraxium/common';
import type { ChatInputCommandInteraction } from 'discord.js';
import { ServerCommand } from '../commands/server.command';

@SlashCommandHandler(ServerCommand, { sub: 'language', group: 'settings' })
export class ServerSettingsLanguageHandler {
  async handle(
    @Ctx() interaction: ChatInputCommandInteraction,
    @SlashStringOption('locale') locale: string,
  ): Promise<void> {
    await interaction.reply(`🌐 Server language updated to \`${locale}\`.`);
  }
}
