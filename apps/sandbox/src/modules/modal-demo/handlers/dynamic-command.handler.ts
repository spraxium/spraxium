import { Ctx, SlashCommandHandler } from '@spraxium/common';
import { ModalService } from '@spraxium/components';
import type { ChatInputCommandInteraction } from 'discord.js';
import { ModalDemoCommand } from '../commands/modal-demo.command';
import type { DynamicModalData } from '../modals/component-modals';
import { DynamicModal } from '../modals/component-modals';

@SlashCommandHandler(ModalDemoCommand, { sub: 'dynamic' })
export class DynamicCommandHandler {
  constructor(private readonly modals: ModalService) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const data: DynamicModalData = {
      categories: ['Commands', 'Events', 'HTTP'],
      allowNote: true,
    };

    const modal = this.modals.build(DynamicModal, data);
    await interaction.showModal(modal);
  }
}
