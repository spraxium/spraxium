import { Ctx, SlashCommandHandler } from '@spraxium/common';
import type { ModalService } from '@spraxium/components';
import { type I18nService, buildLocalizedModal } from '@spraxium/i18n';
import type { ChatInputCommandInteraction } from 'discord.js';
import { ProfileCommand } from '../commands/profile.command';
import { EditProfileModal } from '../components/edit-profile-modal.component';

@SlashCommandHandler(ProfileCommand, { sub: 'edit' })
export class ProfileEditHandler {
  constructor(
    private readonly i18n: I18nService,
    private readonly modals: ModalService,
  ) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const locale = await this.i18n.getUserLocale(interaction.user.id);
    const cachedValues = this.modals.getCacheFor(EditProfileModal, interaction) ?? undefined;
    const modal = buildLocalizedModal({ modalClass: EditProfileModal, locale, cachedValues });
    await interaction.showModal(modal);
  }
}
