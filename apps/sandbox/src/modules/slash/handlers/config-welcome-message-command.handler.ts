import { Ctx, SlashCommandHandler, SlashStringOption } from '@spraxium/common';
import { Logger } from '@spraxium/logger';
import type { ChatInputCommandInteraction } from 'discord.js';
import { ConfigCommand } from '../commands/config.command';

@SlashCommandHandler(ConfigCommand, { sub: 'message', group: 'welcome' })
export class ConfigWelcomeMessageHandler {
  private readonly logger = new Logger(ConfigWelcomeMessageHandler.name);

  async handle(
    @Ctx() interaction: ChatInputCommandInteraction,
    @SlashStringOption('template') template: string,
  ): Promise<void> {
    this.logger.info(`Welcome template updated by ${interaction.user.tag}`);
    await interaction.reply(`📝 Welcome message template updated:\n> ${template}`);
  }
}
