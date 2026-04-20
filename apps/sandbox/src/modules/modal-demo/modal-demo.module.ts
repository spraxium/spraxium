import { Module } from '@spraxium/common';
import { ModalService } from '@spraxium/components';
import { ModalDemoCommand } from './commands/modal-demo.command';
import { DynamicCommandHandler } from './handlers/dynamic-command.handler';
import { DynamicModalHandler } from './handlers/dynamic-modal.handler';
import { FeedbackCommandHandler } from './handlers/feedback-command.handler';
import { FeedbackModalHandler } from './handlers/feedback-modal.handler';
import { ReportCommandHandler } from './handlers/report-command.handler';
import { ReportModalHandler } from './handlers/report-modal.handler';
import { SelectCommandHandler } from './handlers/select-command.handler';
import { SelectModalHandler } from './handlers/select-modal.handler';

@Module({
  providers: [ModalService],
  commands: [ModalDemoCommand],
  handlers: [
    FeedbackCommandHandler,
    FeedbackModalHandler,
    ReportCommandHandler,
    ReportModalHandler,
    SelectCommandHandler,
    SelectModalHandler,
    DynamicCommandHandler,
    DynamicModalHandler,
  ],
})
export class ModalDemoModule {}
