import { Ctx, SlashCommandHandler } from '@spraxium/common';
import { ContextService, SelectService } from '@spraxium/components';
import type { ChatInputCommandInteraction } from 'discord.js';
import { MessageFlags } from 'discord.js';
import { FlowCommand } from '../commands/flow.command';
import { FlowCategorySelect } from '../components/flow-category-select.component';

export interface WizardData {
  category: string;
  step: number;
}

@SlashCommandHandler(FlowCommand, { sub: 'wizard' })
export class FlowWizardCommandHandler {
  constructor(
    private readonly selects: SelectService,
    private readonly contexts: ContextService,
  ) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {

    const ctx = await this.contexts.create<WizardData>(
      { category: '', step: 1 },
      { ttl: 300, restrictedTo: interaction.user.id },
    );

    const row = await this.selects.build(FlowCategorySelect, undefined, ctx);

    await interaction.reply({
      content: [
        '📋 **Issue Reporter - Step 1 / 2**',        '',
        'What **category** best describes your issue?',
        '',
        '> Context is scoped to **you** - others cannot advance this wizard.',,
      ].join('\n'),
      components: [row],
      flags: MessageFlags.Ephemeral,
    });
  }
}
