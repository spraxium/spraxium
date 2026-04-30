import { Ctx, SlashCommandHandler, SlashOpt } from '@spraxium/common';
import { I18nService } from '@spraxium/i18n';
import type { ChatInputCommandInteraction } from 'discord.js';
import { DemoCommand } from '../commands/demo.command';

@SlashCommandHandler(DemoCommand, { sub: 'plural' })
export class DemoPluralHandler {
  constructor(private readonly i18n: I18nService) {}

  async handle(
    @Ctx() interaction: ChatInputCommandInteraction,
    @SlashOpt('count') count: number,
  ): Promise<void> {
    const userId = interaction.user.id;
    const userLocale = await this.i18n.getUserLocale(userId);

    const enResult = this.i18n.tp('commands.demo.plural.items', 'en-US', count, { count });
    const ptResult = this.i18n.tp('commands.demo.plural.items', 'pt-BR', count, { count });

    const userResult = await this.i18n.tpUser(userId, 'commands.demo.plural.items', count, { count });

    const enCategory = new Intl.PluralRules('en-US').select(count);
    const ptCategory = new Intl.PluralRules('pt-BR').select(count);

    await interaction.reply(
      [
        `## 🔢 Pluralization — count: \`${count}\``,
        '',
        '**tp() — explicit locale:**',
        `  en-US (category: \`${enCategory}\`) → **${enResult}**`,
        `  pt-BR (category: \`${ptCategory}\`) → **${ptResult}**`,
        '',
        '**tpUser() — your stored locale:**',
        `  Your locale: \`${userLocale}\``,
        `  Result → **${userResult}**`,
        '',
        `*Keys used: \`commands.demo.plural.items_one\` / \`items_other\`*`,
      ].join('\n'),
    );
  }
}
