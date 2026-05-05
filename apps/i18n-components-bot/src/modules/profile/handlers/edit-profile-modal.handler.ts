import { Ctx } from '@spraxium/common';
import { ModalHandler } from '@spraxium/components';
import type { ModalSubmitInteraction } from 'discord.js';
import { EditProfileModal } from '../components/edit-profile-modal.component';

@ModalHandler(EditProfileModal)
export class EditProfileModalHandler {
  async handle(@Ctx() interaction: ModalSubmitInteraction): Promise<void> {
    const bio = interaction.fields.getTextInputValue('bio');
    const location = interaction.fields.getTextInputValue('location');

    const lines: string[] = [];
    if (bio) lines.push(`📝 **Bio:** ${bio}`);
    if (location) lines.push(`📍 **Location:** ${location}`);
    const content =
      lines.length > 0 ? `✅ Profile updated!\n${lines.join('\n')}` : '✅ Profile saved with no changes.';

    await interaction.reply({ content, flags: 'Ephemeral' });
  }
}
