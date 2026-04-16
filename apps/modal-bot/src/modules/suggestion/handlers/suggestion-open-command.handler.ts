import { Ctx, SlashCommandHandler } from '@spraxium/common';

import { ModalService } from '@spraxium/components';
import type { ChatInputCommandInteraction } from 'discord.js';
import { SuggestionCommand } from '../commands/suggestion.command';
import { SuggestionModal } from '../components/suggestion-modal.component';
import type { SuggestionData } from '../interfaces/suggestion-data.interface';

@SlashCommandHandler(SuggestionCommand, { sub: 'submit' })
export class SuggestionOpenCommandHandler {
  constructor(private readonly modals: ModalService) {}

  async handle(@Ctx() interaction: ChatInputCommandInteraction): Promise<void> {
    const data: SuggestionData = {
      categories: [
        { id: 'ux', label: 'User Experience' },
        { id: 'perf', label: 'Performance' },
        { id: 'docs', label: 'Documentation' },
      ],
      includeUrl: true,
    };

    const modal = this.modals.build(SuggestionModal, data);
    await interaction.showModal(modal);
  }
}
