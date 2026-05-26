import { Ctx, SlashCommandHandler } from '@spraxium/common';
import { SelectService } from '@spraxium/components';
import { type ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { TicketCommand } from '../commands/ticket.command';
import { TicketCategoryPayloadSelect } from '../components/ticket-category-payload-select.component';

@SlashCommandHandler(TicketCommand, { sub: 'payload' })
export class TicketPayloadCommandHandler {
  constructor(private readonly selects: SelectService) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply({
      content: '🎫 **Store payload demo**, select a category to open the ticket form:',
      components: [await this.selects.build(TicketCategoryPayloadSelect)],
      flags: MessageFlags.Ephemeral,
    });
  }
}
