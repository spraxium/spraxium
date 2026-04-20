import { Ctx, SlashCommandHandler } from '@spraxium/common';
import { ModalService } from '@spraxium/components';
import type { ChatInputCommandInteraction } from 'discord.js';
import { ModalDemoCommand } from '../commands/modal-demo.command';
import { SelectModal } from '../modals/component-modals';

@SlashCommandHandler(ModalDemoCommand, { sub: 'select' })
export class SelectCommandHandler {
  constructor(private readonly modals: ModalService) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const modal = this.modals.build(SelectModal);
    await interaction.showModal(modal);
  }
}
