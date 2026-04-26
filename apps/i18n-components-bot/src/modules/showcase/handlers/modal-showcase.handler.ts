import { Ctx, SlashCommandHandler } from '@spraxium/common';
import { buildLocalizedModal } from '@spraxium/i18n';
import type { I18nService } from '@spraxium/i18n';
import type { ChatInputCommandInteraction } from 'discord.js';
import { ShowcaseCommand } from '../commands/showcase.command';
import { FeedbackModal } from '../components/feedback-modal.component';

@SlashCommandHandler(ShowcaseCommand, { sub: 'modal' })
export class ModalShowcaseHandler {
  constructor(private readonly i18n: I18nService) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const locale = await this.i18n.getUserLocale(interaction.user.id);

    await interaction.showModal(buildLocalizedModal({ modalClass: FeedbackModal, locale }));
  }
}
