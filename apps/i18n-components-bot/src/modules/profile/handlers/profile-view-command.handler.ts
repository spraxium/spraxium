import { Ctx, SlashCommandHandler } from '@spraxium/common';
import { buildLocalizedButton, buildLocalizedEmbed, buildLocalizedSelect } from '@spraxium/i18n';
import type { I18nService } from '@spraxium/i18n';
import type { ChatInputCommandInteraction } from 'discord.js';
import { ProfileCommand } from '../commands/profile.command';
import { EditProfileButton } from '../components/edit-profile-button.component';
import { LocaleSelect } from '../components/locale-select.component';
import { ProfileEmbed } from '../components/profile-embed.component';
import type { ProfileData } from '../components/profile-embed.component';
import { ShareProfileButton } from '../components/share-profile-button.component';

@SlashCommandHandler(ProfileCommand, { sub: 'view' })
export class ProfileViewHandler {
  constructor(private readonly i18n: I18nService) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const userId = interaction.user.id;
    const locale = await this.i18n.getUserLocale(userId);

    const data: ProfileData = {
      username: interaction.user.username,
      locale,
      joined: interaction.user.createdAt.toLocaleDateString(locale),
    };

    const embed = buildLocalizedEmbed({ embedClass: ProfileEmbed, locale, data });
    const buttonRow = buildLocalizedButton({ input: [EditProfileButton, ShareProfileButton], locale });
    const selectRow = await buildLocalizedSelect({ selectClass: LocaleSelect, locale });

    await interaction.reply({
      embeds: [embed],
      components: [buttonRow, selectRow],
      flags: 'Ephemeral',
    });
  }
}
