import { Ctx, SlashCommandHandler, SlashOpt } from '@spraxium/common';
// biome-ignore lint/style/useImportType: DI requires runtime type for reflect-metadata
import { I18nService } from '@spraxium/i18n';
import type { ChatInputCommandInteraction, User } from 'discord.js';
import { GreetCommand } from '../commands/greet.command';

// /greet user <target>
// Demonstrates: t() with explicit locale — the reply uses the *author's* locale,
// so the greeted user sees the language the author speaks.

@SlashCommandHandler(GreetCommand, { sub: 'user' })
export class GreetUserHandler {
  constructor(private readonly i18n: I18nService) {}

  async handle(
    @Ctx() interaction: ChatInputCommandInteraction,
    @SlashOpt('target') target: User,
  ): Promise<void> {
    if (target.id === interaction.user.id) {
      const selfMsg = await this.i18n.tUser(interaction.user.id, 'commands.greet.user.self');
      await interaction.reply({ content: selfMsg, flags: 'Ephemeral' });
      return;
    }

    const userId = interaction.user.id;
    const locale = await this.i18n.getUserLocale(userId);

    const reply = this.i18n.t('commands.greet.user.reply', locale, {
      target: `<@${target.id}>`,
      author: interaction.user.username,
      locale,
    });

    await interaction.reply(reply);
  }
}
