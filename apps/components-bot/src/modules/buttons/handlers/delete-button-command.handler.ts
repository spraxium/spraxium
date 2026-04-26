import { Ctx } from '@spraxium/common';
import { ButtonHandler } from '@spraxium/components';
import type { ButtonInteraction } from 'discord.js';
import { DeleteButton } from '../components/delete-button.component';

@ButtonHandler(DeleteButton)
export class DeleteButtonCommandHandler {
  async handle(@Ctx() interaction: ButtonInteraction): Promise<void> {
    await interaction.reply({ content: '🗑️ Delete button clicked!', flags: 'Ephemeral' });
  }
}
