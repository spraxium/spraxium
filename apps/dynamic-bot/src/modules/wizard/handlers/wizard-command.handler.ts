import { Ctx, SlashCommandHandler } from '@spraxium/common';
import { ButtonService, ContextService } from '@spraxium/components';
import { type ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { WizardCommand } from '../commands/wizard.command';
import { PickColorButton } from '../components/pick-color-button.component';
import { COLOR_OPTIONS, type WizardData } from '../wizard.data';

@SlashCommandHandler(WizardCommand)
export class WizardCommandHandler {
  constructor(
    private readonly buttons: ButtonService,
    private readonly contexts: ContextService,
  ) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const ctx = await this.contexts.create<WizardData>(
      { username: interaction.user.username, selectedColor: null },
      { ttl: 300, restrictedTo: interaction.user.id },
    );

    const rows = await this.buttons.buildDynamic(PickColorButton, COLOR_OPTIONS, ctx);

    await interaction.reply({
      content: [
        `## 🪄 Color picker for **${interaction.user.username}**`,
        '',
        '> The flow context is scoped to you — only you can advance this wizard.',
        '> Each button carries its own `ColorOption` payload.',
      ].join('\n'),
      components: rows,
      flags: MessageFlags.Ephemeral,
    });
  }
}
