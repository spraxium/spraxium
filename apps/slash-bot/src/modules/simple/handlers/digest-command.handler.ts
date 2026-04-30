import { AutoDefer, Ctx, SlashCommandHandler } from '@spraxium/common';
import type { ChatInputCommandInteraction } from 'discord.js';
import { DigestCommand } from '../commands/digest.command';

/**
 * Takes ~3000 ms to respond -- past the 2000 ms threshold.
 * AutoDefer fires automatically and defers the interaction behind the scenes.
 * The handler still calls interaction.reply(); the framework transparently
 * routes it to editReply() because the interaction was already deferred.
 */
@SlashCommandHandler(DigestCommand)
@AutoDefer({ ephemeral: true, threshold: 2000 })
export class DigestHandler {
  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    // Simulates a slow external API call or heavy data aggregation (~3000 ms)
    await new Promise((resolve) => setTimeout(resolve, 3_000));

    await interaction.reply(
      '📋 **Daily Digest**\n\n' +
        '- Messages sent today: **1 284**\n' +
        '- New members: **7**\n' +
        '- Active channels: **12**\n\n' +
        '*(took ~3000 ms -- auto-defer kicked in at 2000 ms)*',
    );
  }
}
