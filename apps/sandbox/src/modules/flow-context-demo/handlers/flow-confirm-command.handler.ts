import { Ctx, SlashCommandHandler } from '@spraxium/common';
import { ButtonService } from '@spraxium/components';
import { ContextService } from '@spraxium/components';
import type { ChatInputCommandInteraction } from 'discord.js';
import { MessageFlags } from 'discord.js';
import { FlowCancelButton, FlowConfirmButton } from '../components/flow-buttons';
import { FlowDemoCommand } from '../commands/flow-demo.command';

export interface ConfirmData {
  action: string;
  targetId: string;
}

@SlashCommandHandler(FlowDemoCommand, { sub: 'confirm' })
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
        `Action: \`delete-channel\``,
        `Target: <#${interaction.channelId}>`,
        '',
        '> This context is scoped to **you** and expires in **30 s**.',
        '> Any other user clicking Confirm will be denied automatically.',
      ].join('\n'),
      components: [row],
      flags: MessageFlags.Ephemeral,
    });
  }
}
