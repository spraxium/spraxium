import { Ctx, SlashCommandHandler } from '@spraxium/common';
import { ModalService } from '@spraxium/components';
import type { ChatInputCommandInteraction } from 'discord.js';
import { ModalDemoCommand } from '../commands/modal-demo.command';
import { FeedbackModal } from '../modals/text-modals';

@SlashCommandHandler(ModalDemoCommand, { sub: 'feedback' })
export class FeedbackCommandHandler {
  constructor(private readonly modals: ModalService) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const modal = this.modals.build(FeedbackModal);
    await interaction.showModal(modal);
  }
}
