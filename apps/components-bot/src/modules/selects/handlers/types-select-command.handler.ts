import { Ctx, SlashCommandHandler } from '@spraxium/common';
import type { EmbedService, SelectService } from '@spraxium/components';
import type { ChatInputCommandInteraction } from 'discord.js';
import { SelectsCommand } from '../commands/selects.command';
import { AllSelectTypesEmbed } from '../components/all-select-types-embed.component';
import { AnyMentionSelect } from '../components/any-mention-select.component';
import { MemberUserSelect } from '../components/member-user-select.component';
import { ServerRoleSelect } from '../components/server-role-select.component';
import { TextChannelSelect } from '../components/text-channel-select.component';
import { TopicStringSelect } from '../components/topic-string-select.component';

@SlashCommandHandler(SelectsCommand, { sub: 'types' })
export class TypesSelectCommandHandler {
  constructor(
    private readonly embeds: EmbedService,
    private readonly selects: SelectService,
  ) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = this.embeds.build(AllSelectTypesEmbed);

    await interaction.reply({
      embeds: [embed],
      components: await Promise.all([
        this.selects.build(TopicStringSelect),
        this.selects.build(MemberUserSelect),
        this.selects.build(ServerRoleSelect),
        this.selects.build(AnyMentionSelect),
        this.selects.build(TextChannelSelect),
      ]),
      flags: 'Ephemeral',
    });
  }
}
