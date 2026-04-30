import { Ctx, SlashCommandHandler } from '@spraxium/common';
import type { SelectService } from '@spraxium/components';
import { type ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { TopicsCommand } from '../commands/topics.command';
import { TopicSelect } from '../components/topic-select.component';
import { TOPICS, type TopicsQuery } from '../topics.data';

@SlashCommandHandler(TopicsCommand)
export class TopicsCommandHandler {
  constructor(private readonly selects: SelectService) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const query: TopicsQuery = {
      audience: 'beginner',
      topics: TOPICS.slice(0, 4),
    };

    const row = await this.selects.buildDynamic(TopicSelect, query);

    await interaction.reply({
      content: '## 🧭 Pick your interests',
      components: [row],
      flags: MessageFlags.Ephemeral,
    });
  }
}
