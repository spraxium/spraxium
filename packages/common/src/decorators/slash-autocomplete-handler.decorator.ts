import 'reflect-metadata';
import { METADATA_KEYS } from '../constants/metadata-keys.constant';
import type { SlashAutocompleteHandlerMetadata } from '../interfaces/slash-autocomplete-handler-metadata.interface';

/**
 * Marks a class as an autocomplete handler for a specific option on a slash command.
 *
 * The handler class must implement a `build()` method that receives the
 * `AutocompleteInteraction` and (optionally) the focused value via `@SlashFocused`.
 * Return suggestions by calling `interaction.respond()`.
 *
 * @param command - The `@SlashCommand`-decorated class that owns the option.
 * @param optionName - The name of the `@SlashOption.*` that has `autocomplete: true`.
 *
 * @example
 * // Command definition
 * \@SlashCommand({ name: 'search', description: 'Search items' })
 * export class SearchCommand {
 *   \@SlashOption.String('query', { description: 'Search query', autocomplete: true })
 *   build() {}
 * }
 *
 * // Autocomplete handler
 * \@SlashAutocompleteHandler(SearchCommand, 'query')
 * export class SearchAutocomplete {
 *   async build(
 *     interaction: AutocompleteInteraction,
 *     \@SlashFocused() query: string,
 *   ) {
 *     const results = await db.search(query);
 *     await interaction.respond(results.map((r) => ({ name: r.name, value: r.id })));
 *   }
 * }
 */
export function SlashAutocompleteHandler(command: new () => object, optionName: string): ClassDecorator {
  return (target) => {
    const meta: SlashAutocompleteHandlerMetadata = { command, optionName };
    Reflect.defineMetadata(METADATA_KEYS.SLASH_AUTOCOMPLETE_HANDLER, meta, target);
    Reflect.defineMetadata(METADATA_KEYS.INJECTABLE, true, target);
  };
}
