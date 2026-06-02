import { Module } from '@spraxium/common';
import { ModalService } from '@spraxium/components';
import { ModalParamsDemoCommand } from './commands/modal-params-demo.command';
import { TicketInlineCommandHandler } from './handlers/ticket-inline-command.handler';
import { TicketInlineModalHandler } from './handlers/ticket-inline-modal.handler';
import { TicketPayloadCommandHandler } from './handlers/ticket-payload-command.handler';
import { TicketPayloadModalHandler } from './handlers/ticket-payload-modal.handler';

@Module({
  providers: [ModalService],
  commands: [ModalParamsDemoCommand],
  handlers: [
    TicketInlineCommandHandler,
    TicketInlineModalHandler,
    TicketPayloadCommandHandler,
    TicketPayloadModalHandler,
  ],
})
export class ModalParamsDemoModule {}
