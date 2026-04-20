import { Ctx, SlashCommandHandler } from '@spraxium/common';
import { EmbedService, SelectService } from '@spraxium/components';
import type { ChatInputCommandInteraction } from 'discord.js';
import { ComponentDemoCommand } from '../commands/component-demo.command';
import { type SelectShowcaseData, SelectShowcaseEmbed } from '../schemas/embeds';
import {
  AreasMultiSelect,
  AssignRoleSelect,
  MentionUserSelect,
  TextChannelSelect,
  TopicStringSelect,
} from '../schemas/selects';

@SlashCommandHandler(ComponentDemoCommand, { sub: 'selects' })
export class SelectsDemoHandler {
  constructor(
    private readonly embeds: EmbedService,
    private readonly selects: SelectService,
  ) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const data: SelectShowcaseData = {
      guildName: interaction.guild?.name ?? 'DM',
      memberCount: interaction.guild?.memberCount ?? 0,
    };

    const embed = this.embeds.build(SelectShowcaseEmbed, data);

    await interaction.reply({
      embeds: [embed],
      components: await Promise.all([
        this.selects.build(TopicStringSelect),
        this.selects.build(MentionUserSelect),
        this.selects.build(AssignRoleSelect),
        this.selects.build(TextChannelSelect),
        this.selects.build(AreasMultiSelect),
      ]),
      flags: 'Ephemeral',
    });
  }
}
