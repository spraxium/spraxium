import { Ctx } from '@spraxium/common';
import { ModalService, SelectedValues, StringSelectHandler } from '@spraxium/components';
import type { StringSelectMenuInteraction } from 'discord.js';
import { TicketCategoryPayloadSelect } from '../components/ticket-category-payload-select.component';
import { type TicketCategory, TicketPayloadModal } from '../modals/ticket-modal.component';

@StringSelectHandler(TicketCategoryPayloadSelect)
export class TicketCategoryPayloadSelectHandler {
  constructor(private readonly modals: ModalService) {}

  async handle(
    @SelectedValues() values: string[],
    @Ctx() interaction: StringSelectMenuInteraction,
  ): Promise<void> {
    const category = values[0] as TicketCategory;

    const modal = await this.modals.buildWithPayload(
      TicketPayloadModal,
      { category, openedAt: new Date().toISOString() },
      { ttl: 900, data: { category } satisfies { category: TicketCategory } },
    );

    await interaction.showModal(modal);
  }
}
