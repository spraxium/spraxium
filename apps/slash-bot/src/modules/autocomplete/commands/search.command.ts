import { SlashCommand, SlashOption } from '@spraxium/common';

// Demonstrates autocomplete on a String option.
// @SlashAutocompleteHandler(SearchCommand, 'query') handles the suggesions.
// Discord calls the autocomplete handler on every keystroke.

@SlashCommand({ name: 'search', description: 'Search the knowledge base.' })
export class SearchCommand {
  @SlashOption.String('query', {
    description: 'Search term (suggestions appear as you type)',
    required: true,
    autocomplete: true,
  })
  @SlashOption.Integer('limit', {
    description: 'Maximum number of results',
    required: false,
    min: 1,
    max: 25,
    choices: [
      { name: '5 results', value: 5 },
      { name: '10 results', value: 10 },
      { name: '25 results', value: 25 },
    ],
  })
  build() {}
}
