import { Ctx } from '@spraxium/common';
import { SelectedValues, StringSelectHandler } from '@spraxium/components';
import type { StringSelectMenuInteraction } from 'discord.js';
import { AreasMultiSelect } from '../components/areas-multi-select.component';

@StringSelectHandler(AreasMultiSelect)
export class AreasMultiSelectCommandHandler {
  async handle(
    @SelectedValues() values: string[],
    @Ctx() interaction: StringSelectMenuInteraction,
  ): Promise<void> {
    await interaction.reply({
      content: `✅ Selected areas: **${values.join(', ')}**`,
      flags: 'Ephemeral',
    });
  }
}
