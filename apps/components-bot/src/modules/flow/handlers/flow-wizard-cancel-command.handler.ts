import { Ctx } from '@spraxium/common';
import { ButtonHandler, FlowContext } from '@spraxium/components';
import type { SpraxiumContext } from '@spraxium/components';
import type { ButtonInteraction } from 'discord.js';
import { FlowWizardCancelButton } from '../components/flow-wizard-cancel-button.component';
import type { WizardData } from './flow-wizard-command.handler';

@ButtonHandler(FlowWizardCancelButton)
export class FlowWizardCancelCommandHandler {
  async handle(
    @FlowContext() ctx: SpraxiumContext<WizardData>,
    @Ctx() interaction: ButtonInteraction,
  ): Promise<void> {
    await interaction.update({
      content: '🚫 **Wizard cancelled.** Your report was discarded.',
      components: [],
    });
  }
}
