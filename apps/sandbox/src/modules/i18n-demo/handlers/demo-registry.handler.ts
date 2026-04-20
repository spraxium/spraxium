import { Ctx, SlashCommandHandler } from '@spraxium/common';
import { I18nService } from '@spraxium/i18n';
import type { ChatInputCommandInteraction } from 'discord.js';
import { DemoCommand } from '../commands/demo.command';

@SlashCommandHandler(DemoCommand, { sub: 'registry' })
export class DemoRegistryHandler {
  constructor(private readonly i18n: I18nService) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const userId = interaction.user.id;
    const locale = await this.i18n.resolveLocale(userId, interaction.guildId ?? undefined);

    const allLocales = this.i18n.locales();

    const defaultLocale = this.i18n.default();

    const checks: Array<{ locale: string; registered: boolean }> = [
      { locale: 'en-US', registered: this.i18n.has('en-US') },
      { locale: 'pt-BR', registered: this.i18n.has('pt-BR') },
      { locale: 'zh-CN', registered: this.i18n.has('zh-CN') },
      { locale: 'ja',    registered: this.i18n.has('ja') },
    ];

    const localesLine = this.i18n.t('commands.demo.registry.locales', locale, {
      locales: allLocales.join(', '),
    });
    const defaultLine = this.i18n.t('commands.demo.registry.default', locale, {
      locale: defaultLocale,
    });
    const hasLines = checks.map(({ locale: l, registered }) =>
      this.i18n.t(
        registered ? 'commands.demo.registry.has_true' : 'commands.demo.registry.has_false',
        locale,
        { locale: l },
      ),
    );

    await interaction.reply(
      [
        `## ${this.i18n.t('commands.demo.registry.title', locale)}`,
        '',
        localesLine,
        defaultLine,
        '',
        '**has() checks:**',
        ...hasLines.map((l) => `  ${l}`),
      ].join('\n'),
    );
  }
}
