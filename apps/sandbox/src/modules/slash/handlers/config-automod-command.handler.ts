import { Ctx, SlashCommandHandler, SlashOpt } from '@spraxium/common';
import { Logger } from '@spraxium/core';
import type { ChatInputCommandInteraction } from 'discord.js';
import { ConfigCommand } from '../commands/config.command';

@SlashCommandHandler(ConfigCommand, { sub: 'automod', group: 'moderation' })
export class ConfigAutomodHandler {
  private readonly logger = new Logger(ConfigAutomodHandler.name);

  async handle(
    @Ctx() interaction: ChatInputCommandInteraction,
    @SlashOpt('enabled') enabled: boolean,
    @SlashOpt('filter') filter: string | null,
  ): Promise<void> {
    const state = enabled ? 'enabled' : 'disabled';
    const filterText = filter ? ` (filter: ${filter})` : '';
    this.logger.info(`Automod ${state}${filterText} by ${interaction.user.tag}`);
    await interaction.reply(`🛡️ Automod has been **${state}**${filterText}.`);
  }
}
