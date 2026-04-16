import { Ctx, SlashAutocompleteHandler, SlashFocused } from '@spraxium/common';
import type { AutocompleteInteraction } from 'discord.js';
import { SearchCommand } from '../commands/search.command';

const TOPICS = [
  'Getting started',
  'Installation guide',
  'Configuration options',
  'Slash commands',
  'Prefix commands',
  'Guards and permissions',
  'Modals and forms',
  'Scheduled tasks',
  'Event listeners',
  'Dependency injection',
  'i18n and localization',
  'Sharding',
  'Autocomplete',
  'Context menus',
  'Button components',
];

@SlashAutocompleteHandler(SearchCommand, 'query')
export class SearchQueryAutocomplete {
  async handle(@SlashFocused() focused: string, @Ctx() interaction: AutocompleteInteraction): Promise<void> {
    const term = String(focused).toLowerCase();
    const suggestions = TOPICS.filter((t) => t.toLowerCase().includes(term))
      .slice(0, 25)
      .map((t) => ({ name: t, value: t }));
    await interaction.respond(suggestions);
  }
}
