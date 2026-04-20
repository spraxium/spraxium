import { Ctx, SlashCommandHandler } from '@spraxium/common';
import { V2Service } from '@spraxium/components';
import { MessageFlags, type ChatInputCommandInteraction } from 'discord.js';
import { V2DemoCommand } from '../commands/v2-demo.command';
import {
  type ServerInsightsData,
  ServerInsightsContainer,
} from '../schemas/server-insights.container';

@SlashCommandHandler(V2DemoCommand, { sub: 'class' })
export class V2ClassHandler {
  constructor(private readonly v2: V2Service) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) {
      return;
    }

    const data: ServerInsightsData = {
      guildName: interaction.guild.name,
      memberCount: interaction.guild.memberCount,
      onlineCount:
        interaction.guild.presences?.cache.filter((presence) => presence.status === 'online').size ??
        0,
      boostLevel: interaction.guild.premiumTier,
      iconUrl:
        interaction.guild.iconURL({ size: 128 }) ??
        'https://placehold.co/128x128/5865f2/ffffff.png?text=G',
    };

    const payload = this.v2.buildReply(ServerInsightsContainer, data);

    await interaction.reply({
      ...payload,
      flags: payload.flags | MessageFlags.Ephemeral,
    });
  }
}
