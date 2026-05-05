import { Ctx } from '@spraxium/common';
import { ButtonPayload, DynamicButtonHandler, PayloadRef } from '@spraxium/components';
import type { PayloadHandle } from '@spraxium/components';
import type { ButtonInteraction } from 'discord.js';
import { MessageFlags } from 'discord.js';
import type { Reward } from '../claim.data';
import { ClaimRewardButton } from '../components/claim-reward-button.component';

/**
 * Handles the one-shot claim button. `@PayloadRef()` gives explicit control
 * over the payload lifetime: `ref.consume()` deletes it immediately so any
 * subsequent click receives the "payload expired" error instead of re-running
 * the handler.
 */
@DynamicButtonHandler(ClaimRewardButton)
export class ClaimRewardButtonHandler {
  async handle(
    @Ctx() interaction: ButtonInteraction,
    @ButtonPayload() reward: Reward,
    @PayloadRef() ref: PayloadHandle,
  ): Promise<void> {
    await ref.consume();
    await interaction.reply({
      content: `🎉 You claimed **${reward.amount} ${reward.prize}**! (payload \`${ref.id}\` consumed)`,
      flags: MessageFlags.Ephemeral,
    });
  }
}
