import { Ctx } from '@spraxium/common';
import {
  ButtonParams,
  ButtonPayloadService,
  DynamicButtonHandler,
  type ParamsOf,
} from '@spraxium/components';
import { type ButtonInteraction, MessageFlags } from 'discord.js';
import { CloseTicketButton } from '../components/close-ticket-button.component';
import { TicketsRepository } from '../tickets.repository';

/**
 * Inline-encoded handler. The ticket id arrives via `@ButtonParams<{ id }>()`
 * — no payload lookup required, so the button keeps working even after the
 * payload TTL would have expired. On close we revoke every assign-ref the
 * ticket minted via `ButtonPayloadService.revokeMany()`.
 */
@DynamicButtonHandler(CloseTicketButton)
export class CloseTicketButtonHandler {
  constructor(
    private readonly tickets: TicketsRepository,
    private readonly buttonPayloads: ButtonPayloadService,
  ) {}

  async handle(
    @Ctx() interaction: ButtonInteraction,
    @ButtonParams<ParamsOf<typeof CloseTicketButton>>() params: { id: string },
  ): Promise<void> {
    const ticket = await this.tickets.get(params.id);
    if (!ticket) {
      await interaction.reply({
        content: `❌ Ticket \`${params.id}\` no longer exists.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const refs = await this.tickets.remove(ticket.id);
    await this.buttonPayloads.revokeMany(refs);

    await interaction.reply({
      content: `🔒 Ticket \`${ticket.id}\` closed. Revoked **${refs.length}** assign-button payload(s).`,
      flags: MessageFlags.Ephemeral,
    });
  }
}
