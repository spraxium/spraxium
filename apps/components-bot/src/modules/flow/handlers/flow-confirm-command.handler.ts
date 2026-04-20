import { Ctx, SlashCommandHandler } from '@spraxium/common';
import type { ButtonService, ContextService } from '@spraxium/components';
import type { ChatInputCommandInteraction } from 'discord.js';
import { MessageFlags } from 'discord.js';
import { FlowCommand } from '../commands/flow.command';
import { FlowCancelButton } from '../components/flow-cancel-button.component';
import { FlowConfirmButton } from '../components/flow-confirm-button.component';

export interface ConfirmData {
  action: string;
  targetId: string;
}

@SlashCommandHandler(FlowCommand, { sub: 'confirm' })
export class FlowConfirmCommandHandler {
  constructor(
    private readonly buttons: ButtonService,
    private readonly contexts: ContextService,
  ) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const ctx = await this.contexts.create<ConfirmData>(
      { action: 'delete-channel', targetId: interaction.channelId },
      { ttl: 30, restrictedTo: interaction.user.id },
    );

    const row = this.buttons.rowWithContext(ctx, FlowConfirmButton, FlowCancelButton);

    await interaction.reply({
      content: [
        '⚠️ **Confirm destructive action**',
        '',
        'Action: `delete-channel`',
        `Target: <#${interaction.channelId}>`,
        '',
        '> Context is scoped to **you** and expires in **30 s**.',
        '> Another user clicking Confirm will be denied automatically.',
      ].join('\n'),
      components: [row],
      flags: MessageFlags.Ephemeral,
    });
  }
}
