import { Ctx, SlashCommandHandler, SlashStringOption } from '@spraxium/common';
import { ButtonService } from '@spraxium/components';
import { type ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { OpenTicketCommand } from '../commands/open-ticket.command';
import { AssignTicketButton } from '../components/assign-ticket-button.component';
import { CloseTicketButton } from '../components/close-ticket-button.component';
import { TicketsRepository } from '../tickets.repository';

@SlashCommandHandler(OpenTicketCommand)
export class OpenTicketHandler {
  constructor(
    private readonly buttons: ButtonService,
    private readonly tickets: TicketsRepository,
  ) {}

  async handle(
    @Ctx() interaction: ChatInputCommandInteraction,
    @SlashStringOption('subject') subject: string,
  ): Promise<void> {
    const ticket = await this.tickets.create({
      subject,
      openedBy: interaction.user.id,
    });

    const [row, refs] = await this.buttons.buildMixedRow([
      { button: AssignTicketButton, items: [ticket] },
      { button: CloseTicketButton, items: [ticket] },
    ]);

    await Promise.all(refs.map((ref) => this.tickets.addAssignRef(ticket.id, ref)));

    await interaction.reply({
      content: [
        `## 🎫 Ticket \`${ticket.id}\``,
        `**Subject:** ${ticket.subject}`,
        `**Opened by:** <@${ticket.openedBy}>`,
        '',
        '> _Assign-button is store-encoded (persisted as payload, ref tracked in JSON DB)._',
        '> _Close-button is inline-encoded (id encoded in the customId)._',
      ].join('\n'),
      components: [row],
      flags: MessageFlags.Ephemeral,
    });
  }
}
