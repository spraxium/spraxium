import { Ctx, SlashCommandHandler, SlashOpt } from '@spraxium/common';
import { I18nService } from '@spraxium/i18n';
import type { ChatInputCommandInteraction } from 'discord.js';
import { LocaleCommand } from '../commands/locale.command';

@SlashCommandHandler(LocaleCommand)
export class LocaleHandler {
  constructor(private readonly i18n: I18nService) {}

  async handle(
    @Ctx() interaction: ChatInputCommandInteraction,
    @SlashOpt('language') language: string,
  ): Promise<void> {
    const userId = interaction.user.id;
    const current = await this.i18n.getUserLocale(userId);

    if (current === language) {
      const msg = await this.i18n.tUser(userId, 'commands.locale.already_set', { locale: language });
      await interaction.reply({ content: msg, flags: 'Ephemeral' });
      return;
    }

    if (!this.i18n.has(language)) {
      const msg = await this.i18n.tUser(userId, 'commands.locale.invalid', {
        locale: language,
        available: this.i18n.locales().join(', '),
      });
      await interaction.reply({ content: msg, flags: 'Ephemeral' });
      return;
    }

    await this.i18n.setUserLocale(userId, language);
    const msg = this.i18n.t('commands.locale.set', language, { locale: language });
    await interaction.reply({ content: msg, flags: 'Ephemeral' });
  }
}
