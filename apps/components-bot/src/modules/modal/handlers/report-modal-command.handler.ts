import { Ctx, SlashCommandHandler } from '@spraxium/common';
import { ModalService } from '@spraxium/components';
import type { ChatInputCommandInteraction } from 'discord.js';
import { ModalCommand } from '../commands/modal.command';
import { ReportModal } from '../components/report-modal.component';

@SlashCommandHandler(ModalCommand, { sub: 'report' })
export class ReportModalCommandHandler {
  constructor(private readonly modals: ModalService) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {

    const modal = this.modals.buildFor(ReportModal, interaction);
    await interaction.showModal(modal);
  }
}
