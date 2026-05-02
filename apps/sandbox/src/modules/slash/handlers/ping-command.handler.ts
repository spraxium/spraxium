import { Ctx, SlashCommandHandler, SlashStringOption } from '@spraxium/common';
import { Logger } from '@spraxium/core';
import { I18nService } from '@spraxium/i18n';
import type { ChatInputCommandInteraction } from 'discord.js';
import { PingCommand } from '../commands/ping.command';

@SlashCommandHandler(PingCommand)
export class PingHandler {
  private readonly logger = new Logger(PingHandler.name);

  constructor(private readonly i18n: I18nService) {}

  async handle(
    @Ctx() interaction: ChatInputCommandInteraction,
    @SlashStringOption('service') service: string | null,
  ): Promise<void> {
    const ws = interaction.client.ws.ping;
    const userId = interaction.user.id;
    const guildId = interaction.guildId ?? undefined;

    if (service) {
      this.logger.debug(`Ping requested for service: ${service}`);
      const msg = await this.i18n.tUser(userId, 'commands.ping.reply_service', { service, ws }, guildId);
      await interaction.reply(msg);
    } else {
      const msg = await this.i18n.tUser(userId, 'commands.ping.reply', { ws }, guildId);
      await interaction.reply(msg);
    }
  }
}
