import { Ctx } from '@spraxium/common';
import { ButtonHandler, FlowContext } from '@spraxium/components';
import type { SpraxiumContext } from '@spraxium/components';
import type { ButtonInteraction } from 'discord.js';
import { FlowCancelButton } from '../components/flow-buttons';
import type { ConfirmData } from './flow-confirm-command.handler';
import type { WizardData } from './flow-wizard-command.handler';

@ButtonHandler(FlowCancelButton)
export class FlowCancelButtonHandler {
  async handle(
    @FlowContext() ctx: SpraxiumContext<ConfirmData | WizardData>,
    @Ctx() interaction: ButtonInteraction,
  ): Promise<void> {
    await interaction.update({
      content: '🚫 **Cancelled.** The flow has been discarded.',
      components: [],
    });
  }
}
