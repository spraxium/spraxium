import { Ctx } from '@spraxium/common';
import { ButtonHandler } from '@spraxium/components';
import type { I18nService } from '@spraxium/i18n';
import type { ButtonInteraction } from 'discord.js';
import { ShareProfileButton } from '../components/share-profile-button.component';

@ButtonHandler(ShareProfileButton)
export class ShareProfileButtonHandler {
  constructor(private readonly i18n: I18nService) {}

  async handle(@Ctx() interaction: ButtonInteraction): Promise<void> {
    const locale = await this.i18n.getUserLocale(interaction.user.id);
    const content = this.i18n.t(locale, 'commands.profile.description');

    await interaction.reply({
      content: `🌐 **${interaction.user.username}** locale: \`${locale}\`\n${content}`,
    });
  }
}
