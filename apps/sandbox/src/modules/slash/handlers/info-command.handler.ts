import { Ctx, SlashCommandHandler } from '@spraxium/common';
import { I18nService } from '@spraxium/i18n';
import { EmbedBuilder, type ChatInputCommandInteraction } from 'discord.js';
import { InfoCommand } from '../commands/info.command';

@SlashCommandHandler(InfoCommand)
export class InfoHandler {
  constructor(private readonly i18n: I18nService) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const userId = interaction.user.id;
    const guildId = interaction.guildId ?? undefined;
    const locale = await this.i18n.resolveLocale(userId, guildId);
    const ws = interaction.client.ws.ping;

    const embed = new EmbedBuilder()
      .setTitle(this.i18n.t('commands.info.embed.title', locale))
      .setDescription(this.i18n.t('commands.info.embed.description', locale))
      .setColor('#5865F2')
      .addFields(
        {
          name: this.i18n.t('commands.info.embed.fields.latency_name', locale),
          value: this.i18n.t('commands.info.embed.fields.latency_value', locale, { ws }),
          inline: true,
        },
        {
          name: this.i18n.t('commands.info.embed.fields.locale_name', locale),
          value: this.i18n.t('commands.info.embed.fields.locale_value', locale, { locale }),
          inline: true,
        },
      );

    await interaction.reply({ embeds: [embed] });
  }
}
