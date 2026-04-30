import { Ctx, SlashCommandHandler } from '@spraxium/common';
import { buildLocalizedEmbed } from '@spraxium/i18n';
import type { I18nService } from '@spraxium/i18n';
import type { ChatInputCommandInteraction } from 'discord.js';
import { ShowcaseCommand } from '../commands/showcase.command';
import { AnnounceEmbed } from '../components/announce-embed.component';
import type { AnnounceData } from '../components/announce-embed.component';

@SlashCommandHandler(ShowcaseCommand, { sub: 'embed' })
export class EmbedShowcaseHandler {
  constructor(private readonly i18n: I18nService) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const locale = await this.i18n.getUserLocale(interaction.user.id);

    const data: AnnounceData = {
      version: '0.2.0',
      package: '@spraxium/i18n',
    };

    const embed = buildLocalizedEmbed({ embedClass: AnnounceEmbed, locale, data });

    await interaction.reply({ embeds: [embed], flags: 'Ephemeral' });
  }
}
