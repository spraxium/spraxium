import { Ctx } from '@spraxium/common';
import { ModalHandler, ModalParams, ModalTextField, type ModalContext } from '@spraxium/components';
import { MessageFlags } from 'discord.js';
import { CATEGORY_LABELS, type TicketCategory, TicketInlineModal } from '../modals/ticket.modal';

interface TicketInlineParams {
  category: TicketCategory;
}

@ModalHandler(TicketInlineModal)
export class TicketInlineModalHandler {
  async handle(
    @ModalParams() { category }: TicketInlineParams,
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

    lines.push(``, `_Submitted via: inline params_`);

    await ctx.reply({ content: lines.join('\n'), flags: MessageFlags.Ephemeral });
  }
}
