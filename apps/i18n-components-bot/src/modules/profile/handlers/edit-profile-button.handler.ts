import { Ctx } from '@spraxium/common';
import { ButtonHandler } from '@spraxium/components';
import type { I18nService } from '@spraxium/i18n';
import { buildLocalizedModal } from '@spraxium/i18n';
import type { ButtonInteraction } from 'discord.js';
import { EditProfileButton } from '../components/edit-profile-button.component';
import { EditProfileModal } from '../components/edit-profile-modal.component';

@ButtonHandler(EditProfileButton)
export class EditProfileButtonHandler {
  constructor(private readonly i18n: I18nService) {}

  async handle(@Ctx() interaction: ButtonInteraction): Promise<void> {
    const locale = await this.i18n.getUserLocale(interaction.user.id);
    await interaction.showModal(buildLocalizedModal({ modalClass: EditProfileModal, locale }));
  }
}
