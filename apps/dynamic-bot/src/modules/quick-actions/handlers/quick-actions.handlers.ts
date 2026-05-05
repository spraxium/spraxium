import { Ctx } from '@spraxium/common';
import { ButtonHandler, SelectedValues, StringSelectHandler } from '@spraxium/components';
import { type ButtonInteraction, MessageFlags, type StringSelectMenuInteraction } from 'discord.js';
import {
  ArchiveButton,
  DeleteButton,
  ExportButton,
  ModeSelect,
  MuteButton,
  PinButton,
  RefreshButton,
  ShareButton,
} from '../components/quick-actions.components';

const ack = async (interaction: ButtonInteraction, label: string) => {
  await interaction.reply({ content: `⚡ ${label} executed.`, flags: MessageFlags.Ephemeral });
};

@ButtonHandler(RefreshButton)
export class RefreshButtonHandler {
  async handle(@Ctx() interaction: ButtonInteraction): Promise<void> {
    await ack(interaction, 'Refresh');
  }
}

@ButtonHandler(ExportButton)
export class ExportButtonHandler {
  async handle(@Ctx() interaction: ButtonInteraction): Promise<void> {
    await ack(interaction, 'Export');
  }
}

@ButtonHandler(ShareButton)
export class ShareButtonHandler {
  async handle(@Ctx() interaction: ButtonInteraction): Promise<void> {
    await ack(interaction, 'Share');
  }
}

@ButtonHandler(ArchiveButton)
export class ArchiveButtonHandler {
  async handle(@Ctx() interaction: ButtonInteraction): Promise<void> {
    await ack(interaction, 'Archive');
  }
}

@ButtonHandler(DeleteButton)
export class DeleteButtonHandler {
  async handle(@Ctx() interaction: ButtonInteraction): Promise<void> {
    await ack(interaction, 'Delete');
  }
}

@ButtonHandler(PinButton)
export class PinButtonHandler {
  async handle(@Ctx() interaction: ButtonInteraction): Promise<void> {
    await ack(interaction, 'Pin');
  }
}

@ButtonHandler(MuteButton)
export class MuteButtonHandler {
  async handle(@Ctx() interaction: ButtonInteraction): Promise<void> {
    await ack(interaction, 'Mute');
  }
}

@StringSelectHandler(ModeSelect)
export class ModeSelectHandler {
  async handle(
    @Ctx() interaction: StringSelectMenuInteraction,
    @SelectedValues() values: ReadonlyArray<string>,
  ): Promise<void> {
    await interaction.reply({
      content: `🛠️ Workflow mode set to **${values[0]}**.`,
      flags: MessageFlags.Ephemeral,
    });
  }
}
