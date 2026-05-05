import { Ctx } from '@spraxium/common';
import { ButtonHandler, SelectedValues, StringSelectHandler } from '@spraxium/components';
import { type ButtonInteraction, MessageFlags, type StringSelectMenuInteraction } from 'discord.js';
import {
  ArchiveButton,
  DiscardButton,
  PickSelect,
  PreviewButton,
  SaveButton,
} from '../components/restyle.components';

/**
 * One handler per button — each replies with the actual customId, proving
 * that render-time label/style overrides never change dispatch routing.
 */
@ButtonHandler(SaveButton)
export class SaveButtonHandler {
  async handle(@Ctx() interaction: ButtonInteraction): Promise<void> {
    await interaction.reply({
      content: `✅ Save clicked — customId \`${interaction.customId}\` (decorator default: 'Action A').`,
      flags: MessageFlags.Ephemeral,
    });
  }
}

@ButtonHandler(DiscardButton)
export class DiscardButtonHandler {
  async handle(@Ctx() interaction: ButtonInteraction): Promise<void> {
    await interaction.reply({
      content: `🗑️ Discard clicked — customId \`${interaction.customId}\` (decorator default: 'Action B').`,
      flags: MessageFlags.Ephemeral,
    });
  }
}

@ButtonHandler(ArchiveButton)
export class ArchiveButtonHandler {
  async handle(@Ctx() interaction: ButtonInteraction): Promise<void> {
    await interaction.reply({
      content: `📦 Archive clicked — customId \`${interaction.customId}\` (decorator default: 'Action C').`,
      flags: MessageFlags.Ephemeral,
    });
  }
}

@ButtonHandler(PreviewButton)
export class PreviewButtonHandler {
  async handle(@Ctx() interaction: ButtonInteraction): Promise<void> {
    await interaction.reply({
      content: `👁️ Preview clicked — customId \`${interaction.customId}\` (decorator default: 'Action D').`,
      flags: MessageFlags.Ephemeral,
    });
  }
}

@StringSelectHandler(PickSelect)
export class PickSelectHandler {
  async handle(
    @Ctx() interaction: StringSelectMenuInteraction,
    @SelectedValues() values: ReadonlyArray<string>,
  ): Promise<void> {
    await interaction.reply({
      content: `🟣 Picked: ${values.join(', ')}`,
      flags: MessageFlags.Ephemeral,
    });
  }
}
