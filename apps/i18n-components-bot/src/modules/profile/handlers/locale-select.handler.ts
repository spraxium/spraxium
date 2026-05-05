import { Ctx } from '@spraxium/common';
import { StringSelectHandler } from '@spraxium/components';
import type { I18nService } from '@spraxium/i18n';
import type { StringSelectMenuInteraction } from 'discord.js';
import { LocaleSelect } from '../components/locale-select.component';

@StringSelectHandler(LocaleSelect)
export class LocaleSelectHandler {
  constructor(private readonly i18n: I18nService) {}

  async handle(@Ctx() interaction: StringSelectMenuInteraction): Promise<void> {
    const selectedLocale = interaction.values[0];
    await this.i18n.setUserLocale(interaction.user.id, selectedLocale);

    const done = this.i18n.t(selectedLocale, 'commands.profile.description');

    await interaction.reply({
      content: `✅ Locale set to \`${selectedLocale}\`. ${done}`,
      flags: 'Ephemeral',
    });
  }
}
