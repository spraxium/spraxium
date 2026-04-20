import { Ctx, SlashCommandHandler, SlashOpt } from '@spraxium/common';
import { Logger } from '@spraxium/core';
import type { ChatInputCommandInteraction, TextChannel } from 'discord.js';
import { ConfigCommand } from '../commands/config.command';

@SlashCommandHandler(ConfigCommand, { sub: 'logging', group: 'moderation' })
export class ConfigLoggingHandler {
  private readonly logger = new Logger(ConfigLoggingHandler.name);

  async handle(
    @Ctx() interaction: ChatInputCommandInteraction,
    @SlashOpt('channel') channel: TextChannel,
  ): Promise<void> {
    this.logger.info(`Logging channel set to #${channel.name} by ${interaction.user.tag}`);
    await interaction.reply(`📝 Moderation logs will now be sent to ${channel}.`);
  }
}
