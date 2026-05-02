import { Ctx, SlashCommandHandler, SlashChannelOption } from '@spraxium/common';
import { Logger } from '@spraxium/core';
import type { ChatInputCommandInteraction, TextChannel } from 'discord.js';
import { ConfigCommand } from '../commands/config.command';

@SlashCommandHandler(ConfigCommand, { sub: 'channel', group: 'welcome' })
export class ConfigWelcomeChannelHandler {
  private readonly logger = new Logger(ConfigWelcomeChannelHandler.name);

  async handle(
    @Ctx() interaction: ChatInputCommandInteraction,
    @SlashChannelOption('channel') channel: TextChannel,
  ): Promise<void> {
    this.logger.info(`Welcome channel set to #${channel.name} by ${interaction.user.tag}`);
    await interaction.reply(`👋 Welcome messages will now be sent to ${channel}.`);
  }
}
