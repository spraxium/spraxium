import { Ctx } from '@spraxium/common';
import {
  ButtonHandler,
  ButtonPayload,
  DynamicButtonHandler,
  DynamicSelectHandler,
  PayloadRef,
  SelectPayload,
  SelectedValues,
} from '@spraxium/components';
import type { PayloadHandle } from '@spraxium/components';
import type { ButtonInteraction, StringSelectMenuInteraction } from 'discord.js';
import { MessageFlags } from 'discord.js';
import { AddCategoryButton } from '../components/add-category-button.component';
import { CategoryButton } from '../components/category-button.component';
import { CategorySelect } from '../components/category-select.component';
import type { PanelCategory } from '../panel.data';
import { ticketOpenedMessage } from '../utils/panel.utils';

@DynamicSelectHandler(CategorySelect)
export class CategorySelectHandler {
  async handle(
    @SelectedValues() values: string[],
    @Ctx() interaction: StringSelectMenuInteraction,
    @SelectPayload() categories: PanelCategory[],
    @PayloadRef() ref: PayloadHandle,
  ): Promise<void> {
    const [categoryId] = values;
    const cat = categories.find((c) => c.id === categoryId);
    await ref.consume();
    await interaction.update({ content: ticketOpenedMessage(cat?.name ?? categoryId), components: [] });
  }
}

@DynamicButtonHandler(CategoryButton)
export class CategoryButtonHandler {
  async handle(
    @Ctx() interaction: ButtonInteraction,
    @ButtonPayload() cat: PanelCategory,
    @PayloadRef() ref: PayloadHandle,
  ): Promise<void> {
    await ref.consume();
    await interaction.update({ content: ticketOpenedMessage(cat.name), components: [] });
  }
}

@ButtonHandler(AddCategoryButton)
export class AddCategoryHandler {
  async handle(@Ctx() interaction: ButtonInteraction): Promise<void> {
    await interaction.reply({
      content: `🚧 In a real bot you'd open a modal here to collect category details.`,
      flags: MessageFlags.Ephemeral,
    });
  }
}
