import { Ctx, SlashCommandHandler } from '@spraxium/common';
import { I18nService, buildSlashLocalizations } from '@spraxium/i18n';
import type { ChatInputCommandInteraction } from 'discord.js';
import { DemoCommand } from '../commands/demo.command';

@SlashCommandHandler(DemoCommand, { sub: 'slash-info' })
export class DemoSlashInfoHandler {
  constructor(private readonly i18n: I18nService) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const userId = interaction.user.id;
    const locale = await this.i18n.resolveLocale(userId, interaction.guildId ?? undefined);

    const localizations = buildSlashLocalizations({
      name: 'commands.demo.name',
      description: 'commands.demo.description',
    });

    const title = this.i18n.t('commands.demo.slash_info.title', locale);
    const description = this.i18n.t('commands.demo.slash_info.description', locale);

    const json = JSON.stringify(localizations, null, 2);

    await interaction.reply(
      [
        `## ${title}`,
        description,
        `\`\`\`json`,
        json,
        `\`\`\``,
        `Default locale \`${this.i18n.default()}\` is excluded — it is the canonical name.`,
      ].join('\n'),
    );
  }
}
