import { Ctx, SlashCommandHandler } from '@spraxium/common';
import { I18nService, LocalizedEmbedBuilder } from '@spraxium/i18n';
import type { ChatInputCommandInteraction } from 'discord.js';
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

    const embed = new LocalizedEmbedBuilder(this.i18n, locale)

      .setTitle('commands.demo.embed.title')
      .setDescription('commands.demo.embed.description')
      .setColor('#5865F2')

      .addLocalizedField({
        nameKey: 'commands.demo.embed.field_locale_name',
        valueKey: 'commands.demo.embed.field_locale_value',
        valueVars: { locale },
        inline: true,
      })
      .addLocalizedField({
        nameKey: 'commands.demo.embed.field_ws_name',
        valueKey: 'commands.demo.embed.field_ws_value',
        valueVars: { ws },
        inline: true,
      })
      .addLocalizedField({
        nameKey: 'commands.demo.embed.field_guild_name',
        valueKey: 'commands.demo.embed.field_guild_value',
        valueVars: { locale: guildLocale },
        inline: true,
      })

      .setFooter('commands.demo.embed.footer', { locale })

      .setTimestamp()
      .build();

    await interaction.reply({ embeds: [embed] });
  }
}
