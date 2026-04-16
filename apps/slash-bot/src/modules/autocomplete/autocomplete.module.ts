import { Module } from '@spraxium/common';
import { SearchCommand } from './commands/search.command';
import { SearchQueryAutocomplete } from './handlers/search-query.autocomplete';
import { SearchHandler } from './handlers/search.handler';

@Module({
  commands: [SearchCommand],
  handlers: [
    SearchHandler, // /search — executes the query
    SearchQueryAutocomplete, // fires on every keystroke for the 'query' option
  ],
})
export class AutocompleteModule {}
