import { Ctx, SlashCommandHandler } from '@spraxium/common';
// biome-ignore lint/style/useImportType: DI requires runtime type for reflect-metadata
import { ModalService } from '@spraxium/components';
import type { ChatInputCommandInteraction } from 'discord.js';
import { ProfileCommand } from '../commands/profile.command';
import { ProfileModal } from '../modals/profile.modal';

// /profile setup — opens the ProfileModal with select/radio/checkbox fields

@SlashCommandHandler(ProfileCommand, { sub: 'setup' })
export class ProfileSetupHandler {
  constructor(private readonly modals: ModalService) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const modal = this.modals.build(ProfileModal);
    await interaction.showModal(modal);
  }
}
