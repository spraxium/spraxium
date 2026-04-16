import { Ctx, SlashCommandHandler } from '@spraxium/common';

import { I18nService, LocaleRegistry } from '@spraxium/i18n';
import type { ChatInputCommandInteraction } from 'discord.js';
import { LocaleCommand } from '../commands/locale.command';

@SlashCommandHandler(LocaleCommand, { sub: 'info' })
export class LocaleInfoHandler {
  constructor(private readonly i18n: I18nService) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const userId = interaction.user.id;
    const userLocale = await this.i18n.getUserLocale(userId);
    const available = this.i18n.locales().join(', ');
    const defaultLocale = LocaleRegistry.getDefault();

    const reply = await this.i18n.tUser(userId, 'commands.locale.info.reply', {
      locale: userLocale,
      available,
      default: defaultLocale,
    });

    await interaction.reply({ content: reply, flags: 'Ephemeral' });
  }
}
