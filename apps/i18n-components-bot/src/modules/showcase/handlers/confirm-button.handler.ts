import { Ctx } from '@spraxium/common';
import { ButtonHandler } from '@spraxium/components';
import type { ButtonInteraction } from 'discord.js';
import { ConfirmButton } from '../components/confirm-button.component';

@ButtonHandler(ConfirmButton)
export class ConfirmButtonHandler {
  async handle(@Ctx() interaction: ButtonInteraction): Promise<void> {
    await interaction.reply({ content: '✅ Confirmed!', flags: 'Ephemeral' });
  }
}
