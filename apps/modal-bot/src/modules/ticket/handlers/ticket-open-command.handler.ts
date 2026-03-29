import { Ctx, SlashCommandHandler } from '@spraxium/common';
// biome-ignore lint/style/useImportType: DI requires runtime type for reflect-metadata
import { ModalService } from '@spraxium/components';
import type { ChatInputCommandInteraction } from 'discord.js';
import { TicketCommand } from '../commands/ticket.command';
import { TicketModal } from '../components/ticket-modal.component';

// /ticket open, opens the TicketModal fresh (no pre-fill)

@SlashCommandHandler(TicketCommand, { sub: 'open' })
export class TicketOpenCommandHandler {
  constructor(private readonly modals: ModalService) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const modal = this.modals.build(TicketModal);
    await interaction.showModal(modal);
  }
}
