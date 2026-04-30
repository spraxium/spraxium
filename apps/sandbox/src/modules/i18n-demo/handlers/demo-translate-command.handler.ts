import { Ctx, SlashCommandHandler } from '@spraxium/common';
import { I18nService } from '@spraxium/i18n';
import type { ChatInputCommandInteraction } from 'discord.js';
import { DemoCommand } from '../commands/demo.command';

@SlashCommandHandler(DemoCommand, { sub: 'translate' })
export class DemoTranslateHandler {
  constructor(private readonly i18n: I18nService) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const userId = interaction.user.id;
    const username = interaction.user.username;

    const inEnUs = this.i18n.t('commands.demo.translate.result', 'en-US', {
      user: username,
      locale: 'en-US',
    });

    const inPtBr = this.i18n.t('commands.demo.translate.result', 'pt-BR', {
      user: username,
      locale: 'pt-BR',
    });

    const userLocale = await this.i18n.getUserLocale(userId);
    const viaUser = await this.i18n.tUser(userId, 'commands.demo.translate.result', {
      user: username,
      locale: userLocale,
    });

    await interaction.reply(
      [
        '## 🔤 `t()` — explicit locale',
        `**en-US →** ${inEnUs}`,
        `**pt-BR →** ${inPtBr}`,
        '',
        '## 👤 `tUser()` — your stored locale',
        `**Your locale:** \`${userLocale}\``,
        `**Result →** ${viaUser}`,
        '',
        `*Use \`/locale\` to change your stored locale and run this again.*`,
      ].join('\n'),
    );
  }
}
