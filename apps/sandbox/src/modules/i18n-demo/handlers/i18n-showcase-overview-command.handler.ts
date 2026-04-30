import { Ctx, SlashCommandHandler, SlashOpt } from '@spraxium/common';
import {
  type InterpolationVars,
  I18nService,
  buildSlashLocalizations,
} from '@spraxium/i18n';
import { EmbedBuilder, type ChatInputCommandInteraction } from 'discord.js';
import { I18nShowcaseCommand } from '../commands/i18n-showcase.command';

@SlashCommandHandler(I18nShowcaseCommand, { sub: 'overview' })
export class I18nShowcaseOverviewHandler {
  constructor(private readonly i18n: I18nService) {}

  async handle(
    @Ctx() interaction: ChatInputCommandInteraction,
    @SlashOpt('count') count: number,
  ): Promise<void> {
    const userId = interaction.user.id;
    const guildId = interaction.guildId ?? undefined;
    const locale = await this.i18n.resolveLocale(userId, guildId);
    const ws = interaction.client.ws.ping;

    const vars: InterpolationVars = {
      user: interaction.user.username,
      locale,
      ws,
    };

    const greeting = this.i18n.t('commands.demo.translate.result', locale, vars);

    const items = this.i18n.tp('commands.demo.plural.items', locale, count, { count });

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
      )
      .setFooter({ text: this.i18n.t('commands.demo.embed.footer', locale, { locale }) })
      .setTimestamp();

    const slashLocs = buildSlashLocalizations({
      name: 'commands.demo.name',
      description: 'commands.demo.description',
    });

    const allLocales = this.i18n.locales();
    const defaultLocale = this.i18n.default();

    await interaction.reply({
      content: [
        `## @spraxium/i18n Showcase`,
        '',
        `**t():** ${greeting}`,
        `**tp(${count}):** ${items}`,
        `**locales():** \`[${allLocales.join(', ')}]\``,
        `**default():** \`${defaultLocale}\``,
        `**has('pt-BR'):** ${this.i18n.has('pt-BR') ? '\\u2705' : '\\u274c'}`,
        '',
        `**Slash localizations:**`,
        `\`\`\`json\n${JSON.stringify(slashLocs, null, 2)}\n\`\`\``,
      ].join('\n'),
      embeds: [embed],
    });
  }
}
