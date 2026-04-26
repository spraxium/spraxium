import { Ctx } from '@spraxium/common';
import { ButtonHandler } from '@spraxium/components';
import type { ButtonInteraction } from 'discord.js';
import { ApproveButton } from '../components/approve-button.component';

@ButtonHandler(ApproveButton)
export class ApproveButtonCommandHandler {
  async handle(@Ctx() interaction: ButtonInteraction): Promise<void> {
    await interaction.reply({ content: '✅ Approve button clicked!', flags: 'Ephemeral' });
  }
}
