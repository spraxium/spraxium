import { Ctx, SlashCommandHandler } from '@spraxium/common';
import { buildLocalizedButton } from '@spraxium/i18n';
import type { I18nService } from '@spraxium/i18n';
import type { ChatInputCommandInteraction } from 'discord.js';
import { ShowcaseCommand } from '../commands/showcase.command';
import { CancelButton } from '../components/cancel-button.component';
import { ConfirmButton } from '../components/confirm-button.component';

@SlashCommandHandler(ShowcaseCommand, { sub: 'button' })
export class ButtonShowcaseHandler {
  constructor(private readonly i18n: I18nService) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const locale = await this.i18n.getUserLocale(interaction.user.id);

    const row = buildLocalizedButton({ input: [ConfirmButton, CancelButton], locale });

    await interaction.reply({
      content: '👇 Click a button, labels are resolved for your locale.',
      components: [row],
      flags: 'Ephemeral',
    });
  }
}
