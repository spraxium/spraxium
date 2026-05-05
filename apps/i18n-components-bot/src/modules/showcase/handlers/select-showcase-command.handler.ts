import { Ctx, SlashCommandHandler } from '@spraxium/common';
import { buildLocalizedSelect } from '@spraxium/i18n';
import type { I18nService } from '@spraxium/i18n';
import type { ChatInputCommandInteraction } from 'discord.js';
import { ShowcaseCommand } from '../commands/showcase.command';
import { TopicSelect } from '../components/topic-select.component';

@SlashCommandHandler(ShowcaseCommand, { sub: 'select' })
export class SelectShowcaseHandler {
  constructor(private readonly i18n: I18nService) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const locale = await this.i18n.getUserLocale(interaction.user.id);

    const row = await buildLocalizedSelect({ selectClass: TopicSelect, locale });

    await interaction.reply({
      content: '👇 Pick a topic, placeholder and option labels are resolved for your locale.',
      components: [row],
      flags: 'Ephemeral',
    });
  }
}
