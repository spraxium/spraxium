import { Module } from '@spraxium/common';
import { SearchCommand } from './commands/search.command';
import { SearchHandler } from './handlers/search-command.handler';
import { SearchQueryAutocomplete } from './handlers/search-query.autocomplete';

@Module({
  commands: [SearchCommand],
  handlers: [SearchHandler, SearchQueryAutocomplete],
})
export class AutocompleteModule {}
