import { Ctx } from '@spraxium/common';
import { ButtonHandler } from '@spraxium/components';
import type { ButtonInteraction } from 'discord.js';
import { PrimaryButton } from '../components/primary-button.component';

@ButtonHandler(PrimaryButton)
export class PrimaryButtonCommandHandler {
  async handle(@Ctx() interaction: ButtonInteraction): Promise<void> {
    await interaction.reply({ content: '🟣 Primary button clicked!', flags: 'Ephemeral' });
  }
}
