import { Module } from '@spraxium/common';
import { ModalService } from '@spraxium/components';
import { SuggestionCommand } from './commands/suggestion.command';
import { SuggestionModalSubmitCommandHandler } from './handlers/suggestion-modal-submit-command.handler';
import { SuggestionOpenCommandHandler } from './handlers/suggestion-open-command.handler';

@Module({
  providers: [ModalService],
  commands: [SuggestionCommand],
  handlers: [SuggestionOpenCommandHandler, SuggestionModalSubmitCommandHandler],
})
export class SuggestionModule {}
