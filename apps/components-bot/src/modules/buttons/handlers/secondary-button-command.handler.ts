import { Ctx } from '@spraxium/common';
import { ButtonHandler } from '@spraxium/components';
import type { ButtonInteraction } from 'discord.js';
import { SecondaryButton } from '../components/secondary-button.component';

@ButtonHandler(SecondaryButton)
export class SecondaryButtonCommandHandler {
  async handle(@Ctx() interaction: ButtonInteraction): Promise<void> {
    await interaction.reply({ content: '⬜ Secondary button clicked!', flags: 'Ephemeral' });
  }
}
