import { Ctx, SlashCommandHandler } from '@spraxium/common';
import type { V2Service } from '@spraxium/components';
import { type ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { V2Command } from '../commands/v2.command';
import { TopUsersContainer, type TopUsersData } from '../schemas/top-users.container';

@SlashCommandHandler(V2Command, { sub: 'dynamic' })
export class V2DynamicCommandHandler {
  constructor(private readonly v2: V2Service) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const data: TopUsersData = {
      title: 'Top Players - This Week',
      entries: [
        { username: 'dragonslayer', score: 14850, delta: 320 },
        { username: 'shadow_ninja', score: 13420, delta: -150 },
        { username: 'pixel_wizard', score: 12900, delta: 0 },
        { username: 'frost_archer', score: 11230, delta: 750 },
      ],
    };

    const payload = this.v2.buildReply(TopUsersContainer, data);

    await interaction.reply({
      ...payload,
      flags: payload.flags | MessageFlags.Ephemeral,
    });
  }
}
