import { Ctx, SlashCommandHandler } from '@spraxium/common';
import { ButtonService, SelectService } from '@spraxium/components';
import { type ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { RestyleCommand } from '../commands/restyle.command';
import {
  ArchiveButton,
  DiscardButton,
  PickSelect,
  PreviewButton,
  SaveButton,
} from '../components/restyle.components';

@SlashCommandHandler(RestyleCommand)
export class RestyleCommandHandler {
  constructor(
    private readonly buttons: ButtonService,
    private readonly selects: SelectService,
  ) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const actionRow = this.buttons.build(
      [SaveButton, DiscardButton, ArchiveButton, PreviewButton],
      undefined,
      [
        { label: 'Save', style: 'primary', emoji: '💾' },
        { label: 'Discard', style: 'danger', emoji: '🗑️' },
        { label: 'Archive', style: 'secondary', emoji: '📦' },
        { label: 'Preview', style: 'secondary', emoji: '👁️' },
      ],
    );

    const selectRow = await this.selects.build(PickSelect, undefined, undefined, {
      placeholder: '(overridden) — pick exactly two',
      minValues: 2,
      maxValues: 2,
    });

    await interaction.reply({
      content: '## 🎨 Render-time overrides',
      components: [actionRow, selectRow],
      flags: MessageFlags.Ephemeral,
    });
  }
}
