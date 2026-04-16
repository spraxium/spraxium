import { Ctx, SlashCommandHandler } from '@spraxium/common';

import { ModalService } from '@spraxium/components';
import type { ChatInputCommandInteraction } from 'discord.js';
import { TicketCommand } from '../commands/ticket.command';
import { TicketModal } from '../components/ticket-modal.component';

@SlashCommandHandler(TicketCommand, { sub: 'edit' })
export class TicketEditCommandHandler {
  constructor(private readonly modals: ModalService) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const modal = this.modals.buildFor(TicketModal, interaction);
    await interaction.showModal(modal);
  }
}
