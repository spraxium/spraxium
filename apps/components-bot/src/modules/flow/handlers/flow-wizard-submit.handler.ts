import { Ctx } from '@spraxium/common';
import { ButtonHandler, ContextService, FlowContext } from '@spraxium/components';
import type { SpraxiumContext } from '@spraxium/components';
import type { ButtonInteraction } from 'discord.js';
import { FlowWizardSubmitButton } from '../components/flow-wizard-submit-button.component';
import type { WizardData } from './flow-wizard-command.handler';

const CATEGORY_LABEL: Record<string, string> = {
  bug: '🐛 Bug',
  feature: '✨ Feature',
  docs: '📚 Docs',
  question: '❓ Question',
};

@ButtonHandler(FlowWizardSubmitButton)
export class FlowWizardSubmitHandler {
  constructor(private readonly contexts: ContextService) {}

  async handle(
    @FlowContext() ctx: SpraxiumContext<WizardData>,
    @Ctx() interaction: ButtonInteraction,
  ): Promise<void> {

    await this.contexts.delete(ctx.id);

    await interaction.update({
      content: [
        '📨 **Report submitted!**',
        '',
        `Category: **${CATEGORY_LABEL[ctx.data.category] ?? ctx.data.category}**`,
        `Submitted by: <@${interaction.user.id}>`,
        `Reference ID: \`${ctx.id}\``,
      ].join('\n'),
      components: [],
    });
  }
}
