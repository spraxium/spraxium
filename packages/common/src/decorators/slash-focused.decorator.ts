import 'reflect-metadata';
import { METADATA_KEYS } from '../constants/metadata-keys.constant';

/**
 * Parameter decorator that injects the currently focused option value into
 * an autocomplete handler method.
 *
 * Use this inside a `@SlashAutocompleteHandler` method to receive the partial
 * string the user has typed into the focused option field.
 *
 * @example
 * \@SlashAutocompleteHandler(SearchCommand, 'query')
 * export class SearchAutocomplete {
 *   async build(
 *     interaction: AutocompleteInteraction,
 *     \@SlashFocused() query: string,
 *   ) {
 *     const suggestions = await fetchSuggestions(query);
 *     await interaction.respond(suggestions.map((s) => ({ name: s, value: s })));
 *   }
 * }
 */
export function SlashFocused(): ParameterDecorator {
  return (target: object, propertyKey: string | symbol | undefined, parameterIndex: number): void => {
    if (propertyKey === undefined) return;
    Reflect.defineMetadata(METADATA_KEYS.SLASH_FOCUSED_PARAM, parameterIndex, target, propertyKey);
  };
}
