import { Module } from '@spraxium/common';
import { ModalService } from '@spraxium/components';
import { SuggestionCommand } from './commands/suggestion.command';
import { SuggestionModalHandler } from './handlers/suggestion-modal.handler';
import { SuggestionOpenCommandHandler } from './handlers/suggestion-open-command.handler';

@Module({
  providers: [ModalService],
  commands: [SuggestionCommand],
  handlers: [SuggestionOpenCommandHandler, SuggestionModalHandler],
})
export class SuggestionModule {}
