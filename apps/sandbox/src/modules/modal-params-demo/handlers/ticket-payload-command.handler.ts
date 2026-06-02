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
import { CATEGORY_LABELS, type TicketCategory, TicketPayloadModal } from '../modals/ticket.modal';

@SlashCommandHandler(ModalParamsDemoCommand, { sub: 'payload' })
export class TicketPayloadCommandHandler {
  constructor(private readonly modals: ModalService) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const select = new StringSelectMenuBuilder()
      .setCustomId('ticket_category_payload_select')
      .setPlaceholder('Choose a ticket category…')
      .addOptions(
        (Object.keys(CATEGORY_LABELS) as TicketCategory[]).map((key) =>
          new StringSelectMenuOptionBuilder().setLabel(CATEGORY_LABELS[key]).setValue(key),
        ),
      );

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);

    const reply = await interaction.reply({
      content: '🎫 **Store payload demo** — select a category to open the ticket form:',
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

      // buildWithPayload — category is stored in PayloadService and referenced via ~p:<id>
      const modal = await this.modals.buildWithPayload(
        TicketPayloadModal,
        { category, openedAt: new Date().toISOString() },
        { ttl: 900, data: { category } satisfies { category: TicketCategory } },
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
