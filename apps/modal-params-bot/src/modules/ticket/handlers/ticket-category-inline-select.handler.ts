import { Ctx } from '@spraxium/common';
import { ModalService, SelectedValues, StringSelectHandler } from '@spraxium/components';
import type { StringSelectMenuInteraction } from 'discord.js';
import { TicketCategoryInlineSelect } from '../components/ticket-category-inline-select.component';
import { type TicketCategory, TicketInlineModal } from '../modals/ticket-modal.component';

@StringSelectHandler(TicketCategoryInlineSelect)
export class TicketCategoryInlineSelectHandler {
  constructor(private readonly modals: ModalService) {}

  async handle(
    @SelectedValues() values: string[],
    @Ctx() interaction: StringSelectMenuInteraction,
  ): Promise<void> {
    const category = values[0] as TicketCategory;

    const modal = this.modals.buildWithParams(TicketInlineModal, { category }, { category } satisfies {
      category: TicketCategory;
    });

    await interaction.showModal(modal);
  }
}
