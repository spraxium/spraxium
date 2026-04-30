import { Ctx } from '@spraxium/common';
import { DynamicSelectHandler, SelectPayload, SelectedValues } from '@spraxium/components';
import type { StringSelectMenuInteraction } from 'discord.js';
import { MessageFlags } from 'discord.js';
import { TopicSelect } from '../components/topic-select.component';
import type { TopicsQuery } from '../topics.data';

@DynamicSelectHandler(TopicSelect)
export class TopicSelectHandler {
  async handle(
    @Ctx() interaction: StringSelectMenuInteraction,
    @SelectedValues() picks: ReadonlyArray<string>,
    @SelectPayload() query: TopicsQuery,
  ): Promise<void> {
    const picked = query.topics.filter((t) => picks.includes(t.slug));

    await interaction.reply({
      content: [
        '## ✅ Selection',
        `Audience: **${query.audience}**`,
        `Picked: ${picked.map((t) => `\`${t.name}\``).join(', ')}`,
      ].join('\n'),
      flags: MessageFlags.Ephemeral,
    });
  }
}
