import { Ctx, SlashCommandHandler } from '@spraxium/common';
import type { ButtonService } from '@spraxium/components';
import { type ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import type { Reward } from '../claim.data';
import { ClaimCommand } from '../commands/claim.command';
import { ClaimRewardButton } from '../components/claim-reward-button.component';

const REWARD: Reward = { prize: 'gold coins', amount: 500 };

@SlashCommandHandler(ClaimCommand)
export class ClaimCommandHandler {
  constructor(private readonly buttons: ButtonService) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const rows = await this.buttons.buildDynamic(ClaimRewardButton, [REWARD]);

    await interaction.reply({
      content: [
        '## 🎁 Daily Reward',
        '',
        'Click the button below to claim your reward.',
        '> ⚠️ The button can only be clicked **once**: a second click will receive an "expired" response.',
      ].join('\n'),
      components: rows,
      flags: MessageFlags.Ephemeral,
    });
  }
}
