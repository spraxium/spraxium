import { Ctx, SlashCommandHandler } from '@spraxium/common';
import { V2Service } from '@spraxium/components';
import type { ChatInputCommandInteraction } from 'discord.js';
import { LeaderboardCommand } from '../commands/leaderboard.command';
import { LeaderboardContainer } from '../components/leaderboard.container';
import { PLAYERS } from '../leaderboard.data';

@SlashCommandHandler(LeaderboardCommand)
export class LeaderboardCommandHandler {
  constructor(private readonly v2: V2Service) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const reply = await this.v2.buildReply(LeaderboardContainer, {
      title: 'Top Players — Season 12',
      players: PLAYERS,
    });

    await interaction.reply(reply);
  }
}
