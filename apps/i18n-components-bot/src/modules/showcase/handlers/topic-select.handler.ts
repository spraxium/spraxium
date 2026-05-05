import { Ctx } from '@spraxium/common';
import { SelectedValues, StringSelectHandler } from '@spraxium/components';
import type { StringSelectMenuInteraction } from 'discord.js';
import { TopicSelect } from '../components/topic-select.component';

@StringSelectHandler(TopicSelect)
export class TopicSelectHandler {
  async handle(
    @Ctx() interaction: StringSelectMenuInteraction,
    @SelectedValues() values: Array<string>,
  ): Promise<void> {
    await interaction.reply({
      content: `📋 Selected topic: **${values.join(', ')}**`,
      flags: 'Ephemeral',
    });
  }
}
