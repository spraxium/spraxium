import { Ctx } from '@spraxium/common';
import { ButtonPayload, DynamicButtonHandler, type PayloadHandle, PayloadRef } from '@spraxium/components';
import { type ButtonInteraction, MessageFlags } from 'discord.js';
import { AssignTicketButton } from '../components/assign-ticket-button.component';
import type { Ticket } from '../tickets.data';
import { TicketsRepository } from '../tickets.repository';

/**
 * Store-encoded handler. Receives the persisted ticket snapshot via
 * `@ButtonPayload()` and the ref handle via `@PayloadRef()`. The handler does
 * NOT consume the ref — the ticket might be assigned more than once before
 * being closed; revocation happens on close.
 */
@DynamicButtonHandler(AssignTicketButton)
export class AssignTicketButtonHandler {
  constructor(private readonly tickets: TicketsRepository) {}

  async handle(
    @Ctx() interaction: ButtonInteraction,
    @ButtonPayload() snapshot: Ticket,
    @PayloadRef() ref: PayloadHandle,
  ): Promise<void> {
    const updated = await this.tickets.assign(snapshot.id, interaction.user.id);
    if (!updated) {
      await interaction.reply({
        content: `❌ Ticket \`${snapshot.id}\` no longer exists.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.reply({
      content: `✅ Ticket \`${updated.id}\` assigned to <@${interaction.user.id}> (payload ref \`${ref.id}\` kept for later revocation).`,
      flags: MessageFlags.Ephemeral,
    });
  }
}
