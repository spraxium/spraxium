import { Ctx, SlashCommandHandler } from '@spraxium/common';
import type { ModalService } from '@spraxium/components';
import type { ChatInputCommandInteraction } from 'discord.js';
import { SuggestionCommand } from '../commands/suggestion.command';
import type { SuggestionData } from '../components/suggestion-data.interface';
import { SuggestionModal } from '../components/suggestion-modal.component';

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
