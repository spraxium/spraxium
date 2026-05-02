import { Ctx, SlashBooleanOption, SlashCommandHandler, SlashStringOption } from '@spraxium/common';
import { Logger } from '@spraxium/core';
import type { ChatInputCommandInteraction } from 'discord.js';
import { ConfigCommand } from '../commands/config.command';

@SlashCommandHandler(ConfigCommand, { sub: 'automod', group: 'moderation' })
export class ConfigAutomodHandler {
  private readonly logger = new Logger(ConfigAutomodHandler.name);

  async handle(
    @Ctx() interaction: ChatInputCommandInteraction,
    @SlashBooleanOption('enabled') enabled: boolean,
    @SlashStringOption('filter') filter: string | null,
  ): Promise<void> {
    const state = enabled ? 'enabled' : 'disabled';
    const filterText = filter ? ` (filter: ${filter})` : '';
    this.logger.info(`Automod ${state}${filterText} by ${interaction.user.tag}`);
    await interaction.reply(`🛡️ Automod has been **${state}**${filterText}.`);
  }
}
