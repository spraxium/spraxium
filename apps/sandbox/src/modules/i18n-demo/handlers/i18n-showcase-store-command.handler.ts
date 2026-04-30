import { Ctx, SlashCommandHandler } from '@spraxium/common';
import { I18nService, type InterpolationVars, MemoryStore, defineTranslations } from '@spraxium/i18n';
import type { ChatInputCommandInteraction } from 'discord.js';
import { I18nShowcaseCommand } from '../commands/i18n-showcase.command';

@SlashCommandHandler(I18nShowcaseCommand, { sub: 'store' })
export class I18nShowcaseStoreHandler {
  constructor(private readonly i18n: I18nService) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const userId = interaction.user.id;
    const guildId = interaction.guildId ?? undefined;

    const userLocale = await this.i18n.getUserLocale(userId);
    const resolved = await this.i18n.resolveLocale(userId, guildId);

    let guildLocale = this.i18n.default();
    if (guildId) {
      guildLocale = await this.i18n.getGuildLocale(guildId);
    }

    const translated = await this.i18n.tUser(userId, 'commands.demo.translate.result', {
      user: interaction.user.username,
      locale: resolved,
    } satisfies InterpolationVars);

    const plural = await this.i18n.tpUser(userId, 'commands.demo.plural.items', 5, { count: 5 });

    await interaction.reply(
      [
        `## Store & Resolution Demo`,
        '',
        `**getUserLocale():** \`${userLocale}\``,
        `**getGuildLocale():** \`${guildLocale}\``,
        `**resolveLocale():** \`${resolved}\` (winner)`,
        '',
        `**tUser():** ${translated}`,
        `**tpUser(5):** ${plural}`,
        '',
        '*Priority: user > guild > default*',
        '*Use `/locale` to change your preference.*',
      ].join('\n'),
    );
  }
}
