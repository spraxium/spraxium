import { Ctx, SlashCommandHandler } from '@spraxium/common';

import { ModalService } from '@spraxium/components';
import type { ChatInputCommandInteraction } from 'discord.js';
import { TicketCommand } from '../commands/ticket.command';
import { TicketModal } from '../components/ticket-modal.component';

@SlashCommandHandler(TicketCommand, { sub: 'open' })
export class TicketOpenCommandHandler {
  constructor(private readonly modals: ModalService) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const modal = this.modals.build(TicketModal);
    await interaction.showModal(modal);
  }
}
