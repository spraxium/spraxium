import { Ctx, SlashCommandHandler } from '@spraxium/common';
import type { V2Service } from '@spraxium/components';
import { type ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { V2Command } from '../commands/v2.command';
import { ServerStatsContainer, type ServerStatsData } from '../schemas/server-stats.container';

@SlashCommandHandler(V2Command, { sub: 'class' })
export class V2ClassCommandHandler {
  constructor(private readonly v2: V2Service) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) {
      await interaction.reply({ content: 'This command must be used in a server.', flags: 'Ephemeral' });
      return;
    }

    const data: ServerStatsData = {
      guildName: interaction.guild.name,
      memberCount: interaction.guild.memberCount,
      onlineCount: interaction.guild.presences?.cache.filter((p) => p.status === 'online').size ?? 0,
      boostLevel: interaction.guild.premiumTier,
      iconUrl:
        interaction.guild.iconURL({ size: 128 }) ?? 'https://placehold.co/128x128/5865f2/ffffff.png?text=G',
    };

    const payload = await this.v2.buildReply(ServerStatsContainer, data);

    await interaction.reply({
      ...payload,
      flags: payload.flags | MessageFlags.Ephemeral,
    });
  }
}
