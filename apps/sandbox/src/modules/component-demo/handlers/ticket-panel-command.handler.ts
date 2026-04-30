import { Ctx, SlashCommandHandler } from '@spraxium/common';
import { ButtonService, EmbedService, SelectService } from '@spraxium/components';
import type { ChatInputCommandInteraction } from 'discord.js';
import { ComponentDemoCommand } from '../commands/component-demo.command';
import { CloseTicketButton, DocsLinkButton, OpenTicketButton } from '../schemas/buttons';
import { TicketPanelEmbed } from '../schemas/embeds';
import { TopicStringSelect } from '../schemas/selects';

@SlashCommandHandler(ComponentDemoCommand, { sub: 'ticket-panel' })
export class TicketPanelHandler {
  constructor(
    private readonly embeds: EmbedService,
    private readonly selects: SelectService,
    private readonly buttons: ButtonService,
  ) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = this.embeds.build(TicketPanelEmbed);

    await interaction.reply({
      embeds: [embed],
      components: [
        await this.selects.build(TopicStringSelect),
        this.buttons.build([OpenTicketButton, CloseTicketButton, DocsLinkButton]),
      ],
    });
  }
}
