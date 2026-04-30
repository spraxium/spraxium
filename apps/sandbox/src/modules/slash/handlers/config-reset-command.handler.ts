import { Ctx, SlashCommandHandler } from '@spraxium/common';
import { Logger } from '@spraxium/core';
import type { ChatInputCommandInteraction } from 'discord.js';
import { ConfigCommand } from '../commands/config.command';

@SlashCommandHandler(ConfigCommand, { sub: 'reset' })
export class ConfigResetHandler {
  private readonly logger = new Logger(ConfigResetHandler.name);

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    this.logger.info(`Config reset by ${interaction.user.tag} in guild ${interaction.guildId}`);
    await interaction.reply('🔄 Configuration has been reset to defaults.');
  }
}
