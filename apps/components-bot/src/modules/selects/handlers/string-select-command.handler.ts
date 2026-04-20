import { Ctx, SlashCommandHandler } from '@spraxium/common';
import { EmbedService, SelectService } from '@spraxium/components';
import type { ChatInputCommandInteraction } from 'discord.js';
import { SelectsCommand } from '../commands/selects.command';
import { StringSelectEmbed } from '../components/string-select-embed.component';
import { TopicStringSelect } from '../components/topic-string-select.component';

@SlashCommandHandler(SelectsCommand, { sub: 'string' })
export class StringSelectCommandHandler {
  constructor(
    private readonly embeds: EmbedService,
    private readonly selects: SelectService,
  ) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = this.embeds.build(StringSelectEmbed);

    await interaction.reply({
      embeds: [embed],
      components: [await this.selects.build(TopicStringSelect)],
      flags: 'Ephemeral',
    });
  }
}
