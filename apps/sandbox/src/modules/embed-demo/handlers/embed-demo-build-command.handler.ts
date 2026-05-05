import { Ctx, SlashCommandHandler } from '@spraxium/common';
import { EmbedService } from '@spraxium/components';
import type { ChatInputCommandInteraction } from 'discord.js';
import { EmbedDemoCommand } from '../commands/embed-demo.command';
import { type ServerStatsData, ServerStatsEmbed } from '../schemas/server-stats.embed';

@SlashCommandHandler(EmbedDemoCommand, { sub: 'build' })
export class EmbedDemoBuildHandler {
  constructor(private readonly embeds: EmbedService) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const data: ServerStatsData = {
      ws: interaction.client.ws.ping,
      guildCount: interaction.client.guilds.cache.size,
      userCount: interaction.client.users.cache.size,
      guildName: interaction.guild?.name ?? null,
      channelCount: interaction.guild?.channels.cache.size ?? null,
    };

    const embed = this.embeds.build(ServerStatsEmbed, data);
    await interaction.reply({ embeds: [embed] });
  }
}
