import { Ctx, SlashCommandHandler } from '@spraxium/common';
import { V2Service } from '@spraxium/components';
import { MessageFlags, type ChatInputCommandInteraction } from 'discord.js';
import { V2DemoCommand } from '../commands/v2-demo.command';
import {
  type LeaderboardData,
  LeaderboardContainer,
} from '../schemas/leaderboard.container';

@SlashCommandHandler(V2DemoCommand, { sub: 'dynamic' })
export class V2DynamicHandler {
  constructor(private readonly v2: V2Service) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const data: LeaderboardData = {
      title: 'Top Players - This Week',
      entries: [
        { username: 'dragonslayer', score: 14850, delta: 320 },
        { username: 'shadow_ninja', score: 13420, delta: -150 },
        { username: 'pixel_wizard', score: 12900, delta: 0 },
        { username: 'frost_archer', score: 11230, delta: 750 },
      ],
    };

    const payload = await this.v2.buildReply(LeaderboardContainer, data);

    await interaction.reply({
      ...payload,
      flags: payload.flags | MessageFlags.Ephemeral,
    });
  }
}
