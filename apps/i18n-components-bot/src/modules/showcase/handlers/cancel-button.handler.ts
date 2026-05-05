import { Ctx } from '@spraxium/common';
import { ButtonHandler } from '@spraxium/components';
import type { ButtonInteraction } from 'discord.js';
import { CancelButton } from '../components/cancel-button.component';

@ButtonHandler(CancelButton)
export class CancelButtonHandler {
  async handle(@Ctx() interaction: ButtonInteraction): Promise<void> {
    await interaction.reply({ content: '❌ Cancelled.', flags: 'Ephemeral' });
  }
}
