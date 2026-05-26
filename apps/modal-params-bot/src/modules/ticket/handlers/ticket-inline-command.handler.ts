import { Ctx, SlashCommandHandler } from '@spraxium/common';
import { SelectService } from '@spraxium/components';
import { type ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { TicketCommand } from '../commands/ticket.command';
import { TicketCategoryInlineSelect } from '../components/ticket-category-inline-select.component';

@SlashCommandHandler(TicketCommand, { sub: 'inline' })
export class TicketInlineCommandHandler {
  constructor(private readonly selects: SelectService) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply({
      content: '🎫 **Inline params demo** — select a category to open the ticket form:',
      components: [await this.selects.build(TicketCategoryInlineSelect)],
      flags: MessageFlags.Ephemeral,
    });
  }
}
