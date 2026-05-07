import { Ctx, SlashCommandHandler } from '@spraxium/common';
import { type ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { ListTicketsCommand } from '../commands/list-tickets.command';
import { TicketsRepository } from '../tickets.repository';

@SlashCommandHandler(ListTicketsCommand)
export class ListTicketsHandler {
  constructor(private readonly tickets: TicketsRepository) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const tickets = await this.tickets.list();
    if (tickets.length === 0) {
      await interaction.reply({
        content: '📭 No open tickets. Use `/ticket-open` to create one.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const lines = tickets.map((t) => {
      const assigned = t.assignedTo ? `assigned to <@${t.assignedTo}>` : 'unassigned';
      return `- \`${t.id}\` — **${t.subject}** (${assigned}, ${t.assignRefs.length} ref(s))`;
    });

    await interaction.reply({
      content: ['## 📨 Open tickets', ...lines].join('\n'),
      flags: MessageFlags.Ephemeral,
    });
  }
}
