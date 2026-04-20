import { Ctx, SlashCommandHandler } from '@spraxium/common';
import { ModalService } from '@spraxium/components';
import type { ChatInputCommandInteraction } from 'discord.js';
import { UiDemoCommand } from '../commands/ui-demo.command';
import { UiDemoModal } from '../modals/ui-demo.modal';

@SlashCommandHandler(UiDemoCommand)
export class UiDemoHandler {
  constructor(private readonly modals: ModalService) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.showModal(this.modals.build(UiDemoModal));
  }
}
