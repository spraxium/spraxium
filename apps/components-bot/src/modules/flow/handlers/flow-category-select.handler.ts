import { Ctx } from '@spraxium/common';
import {
  type ButtonService,
  type ContextService,
  FlowContext,
  SelectedValues,
  StringSelectHandler,
} from '@spraxium/components';
import type { SpraxiumContext } from '@spraxium/components';
import type { AnySelectMenuInteraction } from 'discord.js';
import { FlowCategorySelect } from '../components/flow-category-select.component';
import { FlowWizardCancelButton } from '../components/flow-wizard-cancel-button.component';
import { FlowWizardSubmitButton } from '../components/flow-wizard-submit-button.component';
import type { WizardData } from './flow-wizard-command.handler';

const CATEGORY_LABEL: Record<string, string> = {
  bug: '🐛 Bug',
  feature: '✨ Feature',
  docs: '📚 Docs',
  question: '❓ Question',
};

@StringSelectHandler(FlowCategorySelect)
export class FlowCategorySelectHandler {
  constructor(
    private readonly buttons: ButtonService,
    private readonly contexts: ContextService,
  ) {}

  async handle(
    @SelectedValues() values: string[],
    @FlowContext() ctx: SpraxiumContext<WizardData>,
    @Ctx() interaction: AnySelectMenuInteraction,
  ): Promise<void> {
    ctx.data.category = values[0] ?? '';
    ctx.data.step = 2;

    const row = this.buttons.rowWithContext(ctx, FlowWizardSubmitButton, FlowWizardCancelButton);

    await interaction.update({
      content: [
        '📋 **Issue Reporter - Step 2 / 2**',
        '',
        `Category selected: **${CATEGORY_LABEL[ctx.data.category] ?? ctx.data.category}**`,
        '',
        'Click **Submit** to finish or **Cancel** to discard.',
      ].join('\n'),
      components: [row],
    });
  }
}
