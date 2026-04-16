import { Module } from '@spraxium/common';
import { SearchCommand } from './commands/search.command';
import { SearchQueryAutocomplete } from './handlers/search-query.autocomplete';
import { SearchHandler } from './handlers/search.handler';

@Module({
  commands: [SearchCommand],
  handlers: [SearchHandler, SearchQueryAutocomplete],
})
export class AutocompleteModule {}
