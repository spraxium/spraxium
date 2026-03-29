import { Ctx, SlashCommandHandler } from '@spraxium/common';
// biome-ignore lint/style/useImportType: DI requires runtime type for reflect-metadata
import { ModalService } from '@spraxium/components';
import type { ChatInputCommandInteraction } from 'discord.js';
import { TicketCommand } from '../commands/ticket.command';
import { TicketModal } from '../components/ticket-modal.component';

// /ticket edit, re-opens the modal with answers pre-filled from the per-user
// cache that was populated when validation failed on the previous submission.

@SlashCommandHandler(TicketCommand, { sub: 'edit' })
export class TicketEditCommandHandler {
  constructor(private readonly modals: ModalService) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const modal = this.modals.buildFor(TicketModal, interaction);
    await interaction.showModal(modal);
  }
}
