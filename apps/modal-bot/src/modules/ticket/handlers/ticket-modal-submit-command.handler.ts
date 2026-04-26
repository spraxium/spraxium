import { Ctx } from '@spraxium/common';
import { Field, type ModalContext, ModalHandler } from '@spraxium/components';
import { TicketModal } from '../components/ticket-modal.component';

@ModalHandler(TicketModal)
export class TicketModalSubmitCommandHandler {
  async handle(
    @Field('subject') subject: string,
    @Field('description') description: string,
    @Field('email') email: string,
    @Ctx() ctx: ModalContext,
  ): Promise<void> {
    const ticketId = `TICKET-${Date.now().toString(36).toUpperCase()}`;

    const lines = [
      `✅ **Ticket created!** ID: \`${ticketId}\``,
      `**Subject:** ${subject}`,
      `**Description:** ${description}`,
    ];

    if (email) {
      lines.push(`**Contact:** ${email}`);
    }

    await ctx.reply({ content: lines.join('\n'), flags: 'Ephemeral' });
  }
}
