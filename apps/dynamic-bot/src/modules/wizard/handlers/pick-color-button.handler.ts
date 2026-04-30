import { Ctx } from '@spraxium/common';
import {
  ButtonPayload,
  ContextService,
  DynamicButtonHandler,
  FlowContext,
  type SpraxiumContext,
} from '@spraxium/components';
import { type ButtonInteraction, MessageFlags } from 'discord.js';
import { PickColorButton } from '../components/pick-color-button.component';
import type { ColorOption, WizardData } from '../wizard.data';

@DynamicButtonHandler(PickColorButton)
export class PickColorButtonHandler {
  constructor(private readonly contexts: ContextService) {}

  async handle(
    @Ctx() interaction: ButtonInteraction,
    @FlowContext() ctx: SpraxiumContext<WizardData>,
    @ButtonPayload() option: ColorOption,
  ): Promise<void> {
    await this.contexts.update<WizardData>(ctx.id, { selectedColor: option.id });

    await interaction.reply({
      content: [
        `🎨 **${ctx.data.username}**, you picked **${option.name}** (${option.hex}).`,
        `Wizard state persisted to context \`${ctx.id}\`.`,
      ].join('\n'),
      flags: MessageFlags.Ephemeral,
    });
  }
}
