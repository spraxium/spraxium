import { Ctx, SlashCommandHandler } from '@spraxium/common';
import { ModalService } from '@spraxium/components';
import type { ChatInputCommandInteraction } from 'discord.js';
import { ModalDemoCommand } from '../commands/modal-demo.command';
import { ReportModal } from '../modals/text-modals';

@SlashCommandHandler(ModalDemoCommand, { sub: 'report' })
export class ReportCommandHandler {
  constructor(private readonly modals: ModalService) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {

    const modal = this.modals.buildFor(ReportModal, interaction);
    await interaction.showModal(modal);
  }
}
