import { Module } from '@spraxium/common';
import { ModalService } from '@spraxium/components';
import { SuggestionCommand } from './commands/suggestion.command';
import { SuggestionModalHandler } from './handlers/suggestion-modal.handler';
import { SuggestionOpenHandler } from './handlers/suggestion-open.handler';

@Module({
  providers: [ModalService],
  commands: [SuggestionCommand],
  handlers: [
    SuggestionOpenHandler, // /suggestion submit — build() with SuggestionData
    SuggestionModalHandler, // handles SuggestionModal submission
  ],
})
export class SuggestionModule {}
