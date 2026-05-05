import { Module } from '@spraxium/common';
import { ModalService } from '@spraxium/components';
import { ModalCommand } from './commands/modal.command';
import { FeedbackModalCommandHandler } from './handlers/feedback-modal-command.handler';
import { FeedbackModalSubmitCommandHandler } from './handlers/feedback-modal-submit-command.handler';
import { ReportModalCommandHandler } from './handlers/report-modal-command.handler';
import { ReportModalSubmitCommandHandler } from './handlers/report-modal-submit-command.handler';

@Module({
  providers: [ModalService],
  commands: [ModalCommand],
  handlers: [
    FeedbackModalCommandHandler,
    FeedbackModalSubmitCommandHandler,
    ReportModalCommandHandler,
    ReportModalSubmitCommandHandler,
  ],
})
export class ModalModule {}
