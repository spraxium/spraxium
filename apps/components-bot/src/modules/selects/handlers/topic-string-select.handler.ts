import { Ctx } from '@spraxium/common';
import { SelectedValues, StringSelectHandler } from '@spraxium/components';
import type { StringSelectMenuInteraction } from 'discord.js';
import { TopicStringSelect } from '../components/topic-string-select.component';

const TOPIC_LABEL: Record<string, string> = {
  bug: '🐛 Bug report',
  feature: '✨ Feature request',
  question: '❓ Question',
  feedback: '💬 Feedback',
};

@StringSelectHandler(TopicStringSelect)
export class TopicStringSelectHandler {
  async handle(
    @SelectedValues() values: string[],
    @Ctx() interaction: StringSelectMenuInteraction,
  ): Promise<void> {
    const topic = TOPIC_LABEL[values[0] ?? ''] ?? values[0] ?? 'N/A';
    await interaction.reply({
      content: `✅ Selected topic: **${topic}**`,
      flags: 'Ephemeral',
    });
  }
}
