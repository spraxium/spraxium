import { Module } from '@spraxium/common';
import { ModalService } from '@spraxium/components';
import { ModalCommand } from './commands/modal.command';
import { FeedbackModalCommandHandler } from './handlers/feedback-modal-command.handler';
import { FeedbackModalHandler } from './handlers/feedback-modal.handler';
import { ReportModalCommandHandler } from './handlers/report-modal-command.handler';
import { ReportModalHandler } from './handlers/report-modal.handler';

@Module({
  providers: [ModalService],
  commands: [ModalCommand],
  handlers: [
    FeedbackModalCommandHandler,
    FeedbackModalHandler,
    ReportModalCommandHandler,
    ReportModalHandler,
  ],
})
export class ModalModule {}
