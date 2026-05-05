import { Ctx, SlashCommandHandler } from '@spraxium/common';
import { I18nService } from '@spraxium/i18n';
import type { ChatInputCommandInteraction } from 'discord.js';
import { DemoCommand } from '../commands/demo.command';

@SlashCommandHandler(DemoCommand, { sub: 'locale' })
export class DemoLocaleHandler {
  constructor(private readonly i18n: I18nService) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const userId = interaction.user.id;
    const guildId = interaction.guildId ?? undefined;

    const userLocale = await this.i18n.getUserLocale(userId);
    const resolved = await this.i18n.resolveLocale(userId, guildId);
    const defaultLocale = this.i18n.default();

    const userLine = this.i18n.t('commands.demo.locale.user_locale', resolved, { locale: userLocale });
    const resolvedLine = this.i18n.t('commands.demo.locale.resolved', resolved, { locale: resolved });
    const defaultLine = this.i18n.t('commands.demo.locale.default_locale', resolved, { locale: defaultLocale });
    const explanation = this.i18n.t('commands.demo.locale.explanation', resolved);

    let guildLine: string;
    if (guildId) {
      const guildLocale = await this.i18n.getGuildLocale(guildId);
      guildLine = this.i18n.t('commands.demo.locale.guild_locale', resolved, { locale: guildLocale });
    } else {
      guildLine = this.i18n.t('commands.demo.locale.guild_locale_none', resolved);
    }

    await interaction.reply(
      [
        `## ${this.i18n.t('commands.demo.locale.title', resolved)}`,
        '',
        userLine,
        guildLine,
        defaultLine,
        '',
        resolvedLine,
        explanation,
        '',
        `*Use \`/locale\` to set your locale, then run this again to see the chain change.*`,
      ].join('\n'),
    );
  }
}
