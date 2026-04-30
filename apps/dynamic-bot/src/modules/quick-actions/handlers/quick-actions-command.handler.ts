import { Ctx, SlashCommandHandler } from '@spraxium/common';
import type { V2Service } from '@spraxium/components';
import type { ChatInputCommandInteraction } from 'discord.js';
import { QuickActionsCommand } from '../commands/quick-actions.command';
import { QuickActionsContainer } from '../components/quick-actions.container';

@SlashCommandHandler(QuickActionsCommand)
export class QuickActionsCommandHandler {
  constructor(private readonly v2: V2Service) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const reply = await this.v2.buildReply(QuickActionsContainer, { resource: 'doc-42' });
    await interaction.reply(reply);
  }
}
