import { Ctx, SlashCommandHandler } from '@spraxium/common';
import { I18nService, LocalizedEmbedBuilder } from '@spraxium/i18n';
import type { ChatInputCommandInteraction } from 'discord.js';
import { InfoCommand } from '../commands/info.command';

@SlashCommandHandler(InfoCommand)
export class InfoHandler {
  constructor(private readonly i18n: I18nService) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const userId = interaction.user.id;
    const guildId = interaction.guildId ?? undefined;
    const locale = await this.i18n.resolveLocale(userId, guildId);
    const ws = interaction.client.ws.ping;

    const embed = new LocalizedEmbedBuilder(this.i18n, locale)
      .setTitle('commands.info.embed.title')
      .setDescription('commands.info.embed.description')
      .setColor('#5865F2')
      .addLocalizedField({
        nameKey: 'commands.info.embed.fields.latency_name',
        valueKey: 'commands.info.embed.fields.latency_value',
        valueVars: { ws },
        inline: true,
      })
      .addLocalizedField({
        nameKey: 'commands.info.embed.fields.locale_name',
        valueKey: 'commands.info.embed.fields.locale_value',
        valueVars: { locale },
        inline: true,
      })
      .build();

    await interaction.reply({ embeds: [embed] });
  }
}
