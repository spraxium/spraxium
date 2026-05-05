import { Ctx, SlashCommandHandler } from '@spraxium/common';
import { I18nService } from '@spraxium/i18n';
import { EmbedBuilder, type ChatInputCommandInteraction } from 'discord.js';
import { DemoCommand } from '../commands/demo.command';

@SlashCommandHandler(DemoCommand, { sub: 'embed' })
export class DemoEmbedHandler {
  constructor(private readonly i18n: I18nService) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const userId = interaction.user.id;
    const guildId = interaction.guildId ?? undefined;

    const locale = await this.i18n.resolveLocale(userId, guildId);
    const ws = interaction.client.ws.ping;

    const guildLocale = guildId
      ? await this.i18n.getGuildLocale(guildId)
      : this.i18n.default();

    const embed = new EmbedBuilder()
      .setTitle(this.i18n.t('commands.demo.embed.title', locale))
      .setDescription(this.i18n.t('commands.demo.embed.description', locale))
      .setColor('#5865F2')
      .addFields(
        {
          name: this.i18n.t('commands.demo.embed.field_locale_name', locale),
          value: this.i18n.t('commands.demo.embed.field_locale_value', locale, { locale }),
          inline: true,
        },
        {
          name: this.i18n.t('commands.demo.embed.field_ws_name', locale),
          value: this.i18n.t('commands.demo.embed.field_ws_value', locale, { ws }),
          inline: true,
        },
        {
          name: this.i18n.t('commands.demo.embed.field_guild_name', locale),
          value: this.i18n.t('commands.demo.embed.field_guild_value', locale, { locale: guildLocale }),
          inline: true,
        },
      )
      .setFooter({ text: this.i18n.t('commands.demo.embed.footer', locale, { locale }) })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
