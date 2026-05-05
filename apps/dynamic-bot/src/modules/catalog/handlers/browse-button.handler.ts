import { Ctx } from '@spraxium/common';
import { ButtonHandler } from '@spraxium/components';
import type { ButtonInteraction } from 'discord.js';
import { MessageFlags } from 'discord.js';
import { NextPageButton, PrevPageButton } from '../components/browse-button.component';

@ButtonHandler(PrevPageButton)
export class PrevPageButtonHandler {
  async handle(@Ctx() interaction: ButtonInteraction): Promise<void> {
    await interaction.reply({
      content: `◀ Previous page — customId \`${interaction.customId}\` is unchanged by overrides.`,
      flags: MessageFlags.Ephemeral,
    });
  }
}

@ButtonHandler(NextPageButton)
export class NextPageButtonHandler {
  async handle(@Ctx() interaction: ButtonInteraction): Promise<void> {
    await interaction.reply({
      content: `▶ Next page — customId \`${interaction.customId}\` is unchanged by overrides.`,
      flags: MessageFlags.Ephemeral,
    });
  }
}
