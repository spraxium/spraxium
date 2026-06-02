import { Ctx, SlashCommandHandler } from '@spraxium/common';
import { ModalService } from '@spraxium/components';
import {
  type ChatInputCommandInteraction,
  ComponentType,
  MessageFlags,
  type StringSelectMenuInteraction,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
} from 'discord.js';
import { ModalParamsDemoCommand } from '../commands/modal-params-demo.command';
import { CATEGORY_LABELS, type TicketCategory, TicketInlineModal } from '../modals/ticket.modal';

@SlashCommandHandler(ModalParamsDemoCommand, { sub: 'inline' })
export class TicketInlineCommandHandler {
  constructor(private readonly modals: ModalService) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const select = new StringSelectMenuBuilder()
      .setCustomId('ticket_category_inline_select')
      .setPlaceholder('Choose a ticket category…')
      .addOptions(
        (Object.keys(CATEGORY_LABELS) as TicketCategory[]).map((key) =>
          new StringSelectMenuOptionBuilder().setLabel(CATEGORY_LABELS[key]).setValue(key),
        ),
      );

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);

    const reply = await interaction.reply({
      content: '🎫 **Inline params demo** — select a category to open the ticket form:',
      components: [row],
      flags: MessageFlags.Ephemeral,
      withResponse: true,
    });

    const collector = reply.resource?.message?.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 60_000,
      max: 1,
    });

    collector?.on('collect', async (sel: StringSelectMenuInteraction) => {
      const category = sel.values[0] as TicketCategory;

      // buildWithParams — category is encoded inline in the custom ID (~category=bug_report)
      const modal = this.modals.buildWithParams(
        TicketInlineModal,
        { category },
        { category } satisfies { category: TicketCategory },
      );

      await sel.showModal(modal);
      await interaction.deleteReply();
    });

    collector?.on('end', async (_, reason) => {
      if (reason === 'time') {
        await interaction.editReply({ content: '⏱️ Timed out.', components: [] }).catch(() => null);
      }
    });
  }
}
