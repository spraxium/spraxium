import { Ctx, SlashCommandHandler } from '@spraxium/common';
import type { EmbedService, SelectService } from '@spraxium/components';
import type { ChatInputCommandInteraction } from 'discord.js';
import { SelectsCommand } from '../commands/selects.command';
import { AreasMultiSelect } from '../components/areas-multi-select.component';
import { StringSelectEmbed } from '../components/string-select-embed.component';

@SlashCommandHandler(SelectsCommand, { sub: 'multi' })
export class MultiSelectCommandHandler {
  constructor(
    private readonly embeds: EmbedService,
    private readonly selects: SelectService,
  ) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = this.embeds.build(StringSelectEmbed);

    await interaction.reply({
      embeds: [embed],
      components: [await this.selects.build(AreasMultiSelect)],
      flags: 'Ephemeral',
    });
  }
}
