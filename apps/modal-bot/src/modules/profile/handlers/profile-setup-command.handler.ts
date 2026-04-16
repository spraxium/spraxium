import { Ctx, SlashCommandHandler } from '@spraxium/common';
import type { ModalService } from '@spraxium/components';
import type { ChatInputCommandInteraction } from 'discord.js';
import { ProfileCommand } from '../commands/profile.command';
import { ProfileModal } from '../components/profile.modal.component';

@SlashCommandHandler(ProfileCommand, { sub: 'setup' })
export class ProfileSetupCommandHandler {
  constructor(private readonly modals: ModalService) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const modal = this.modals.build(ProfileModal);
    await interaction.showModal(modal);
  }
}
