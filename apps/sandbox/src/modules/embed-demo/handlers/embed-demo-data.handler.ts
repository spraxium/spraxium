import { Ctx, SlashCommandHandler } from '@spraxium/common';
import { EmbedService } from '@spraxium/components';
import type { ChatInputCommandInteraction } from 'discord.js';
import { EmbedDemoCommand } from '../commands/embed-demo.command';
import { type LeaderboardEntry, LeaderboardEntryEmbed } from '../schemas/leaderboard-entry.embed';

const SAMPLE_ENTRY: LeaderboardEntry = {
  rank: 1,
  username: 'PixelWizard',
  score: 24_850,
  wins: 142,
  losses: 18,
};

@SlashCommandHandler(EmbedDemoCommand, { sub: 'data' })
export class EmbedDemoDataHandler {
  constructor(private readonly embeds: EmbedService) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = this.embeds.build(LeaderboardEntryEmbed, SAMPLE_ENTRY);
    await interaction.reply({ embeds: [embed] });
  }
}
