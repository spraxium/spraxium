import { Ctx, SlashCommandHandler, SlashStringOption } from '@spraxium/common';
import type { ChatInputCommandInteraction } from 'discord.js';
import { ServerCommand } from '../commands/server.command';

@SlashCommandHandler(ServerCommand, { sub: 'prefix', group: 'settings' })
export class ServerSettingsPrefixHandler {
  async handle(
    @Ctx() interaction: ChatInputCommandInteraction,
    @SlashStringOption('prefix') prefix: string,
  ): Promise<void> {
    await interaction.reply(`✅ Command prefix updated to \`${prefix}\`.`);
  }
}
