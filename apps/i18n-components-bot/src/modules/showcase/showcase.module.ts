import { Module } from '@spraxium/common';
import { V2Service } from '@spraxium/components';
import { ShowcaseCommand } from './commands/showcase.command';
import { ButtonShowcaseHandler } from './handlers/button-showcase-command.handler';
import { CancelButtonHandler } from './handlers/cancel-button.handler';
import { ConfirmButtonHandler } from './handlers/confirm-button.handler';
import { EmbedShowcaseHandler } from './handlers/embed-showcase-command.handler';
import { FeedbackModalHandler } from './handlers/feedback-modal.handler';
import { ModalShowcaseHandler } from './handlers/modal-showcase-command.handler';
import { SelectShowcaseHandler } from './handlers/select-showcase-command.handler';
import { TopicSelectHandler } from './handlers/topic-select.handler';
import { V2ShowcaseHandler } from './handlers/v2-showcase-command.handler';

@Module({
  commands: [ShowcaseCommand],
  providers: [V2Service],
  handlers: [
    EmbedShowcaseHandler,
    ButtonShowcaseHandler,
    ConfirmButtonHandler,
    CancelButtonHandler,
    SelectShowcaseHandler,
    TopicSelectHandler,
    ModalShowcaseHandler,
    FeedbackModalHandler,
    V2ShowcaseHandler,
  ],
})
export class ShowcaseModule {}
