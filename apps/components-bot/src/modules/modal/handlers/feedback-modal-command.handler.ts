import { Ctx, SlashCommandHandler } from '@spraxium/common';
import type { ModalService } from '@spraxium/components';
import type { ChatInputCommandInteraction } from 'discord.js';
import { ModalCommand } from '../commands/modal.command';
import { FeedbackModal } from '../components/feedback-modal.component';

@SlashCommandHandler(ModalCommand, { sub: 'feedback' })
export class FeedbackModalCommandHandler {
  constructor(private readonly modals: ModalService) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const modal = this.modals.build(FeedbackModal);
    await interaction.showModal(modal);
  }
}
