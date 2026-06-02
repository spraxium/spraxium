import { Ctx } from '@spraxium/common';
import { ModalHandler, ModalPayload, ModalTextField, type ModalContext } from '@spraxium/components';
import { MessageFlags } from 'discord.js';
import { CATEGORY_LABELS, type TicketCategory, TicketPayloadModal } from '../modals/ticket.modal';

interface TicketStoredPayload {
  category: TicketCategory;
  openedAt: string;
}

@ModalHandler(TicketPayloadModal)
export class TicketPayloadModalHandler {
  async handle(
    @ModalPayload() { category, openedAt }: TicketStoredPayload,
    @ModalTextField('subject') subject: string,
    @ModalTextField('description') description: string,
    @ModalTextField('steps') steps: string,
    @ModalTextField('invoiceId') invoiceId: string,
    @Ctx() ctx: ModalContext,
  ): Promise<void> {
    const lines = [
      `📋 **Ticket received!**`,
      ``,
      `**Category:** ${CATEGORY_LABELS[category] ?? category}`,
      `**Subject:** ${subject}`,
      `**Description:**\n> ${description.replace(/\n/g, '\n> ')}`,
    ];

    if (category === 'bug_report' && steps) {
      lines.push(`**Steps to reproduce:**\n> ${steps.replace(/\n/g, '\n> ')}`);
    }
    if (category === 'billing' && invoiceId) {
      lines.push(`**Invoice ID:** \`${invoiceId}\``);
    }

    lines.push(``, `_Opened at: ${openedAt}_`);
    lines.push(`_Submitted via: store payload_`);

    await ctx.reply({ content: lines.join('\n'), flags: MessageFlags.Ephemeral });
  }
}
