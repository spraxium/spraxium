import { Ctx } from '@spraxium/common';
import { ButtonHandler, ButtonPayload } from '@spraxium/components';
import type { ButtonInteraction } from 'discord.js';
import { BoomButton, ExpiredButton } from '../components/errors.components';

@ButtonHandler(BoomButton)
export class BoomButtonHandler {
  async handle(@Ctx() _interaction: ButtonInteraction): Promise<void> {
    throw new Error('intentional crash from BoomButtonHandler');
  }
}

@ButtonHandler(ExpiredButton)
export class ExpiredButtonHandler {
  async handle(@Ctx() interaction: ButtonInteraction, @ButtonPayload() _payload: unknown): Promise<void> {
    await interaction.reply({ content: 'This should never be reached.', ephemeral: true });
  }
}
