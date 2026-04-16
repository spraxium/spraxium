import { Ctx, SlashCommandHandler } from '@spraxium/common';
import type { I18nService } from '@spraxium/i18n';
import type { ChatInputCommandInteraction } from 'discord.js';
import { GreetCommand } from '../commands/greet.command';

@SlashCommandHandler(GreetCommand, { sub: 'me' })
export class GreetMeHandler {
  constructor(private readonly i18n: I18nService) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const userId = interaction.user.id;
    const username = interaction.user.username;
    const locale = await this.i18n.getUserLocale(userId);

    const reply = await this.i18n.tUser(userId, 'commands.greet.me.reply', {
      user: username,
      locale,
    });

    const tip = await this.i18n.tUser(userId, 'commands.greet.me.tip');

    await interaction.reply({ content: `${reply}\n${tip}`, flags: 'Ephemeral' });
  }
}
