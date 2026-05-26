import { Module } from '@spraxium/common';
import { ModalService, SelectService } from '@spraxium/components';
import { TicketCommand } from './commands/ticket.command';
import { TicketCategoryInlineSelectHandler } from './handlers/ticket-category-inline-select.handler';
import { TicketCategoryPayloadSelectHandler } from './handlers/ticket-category-payload-select.handler';
import { TicketInlineCommandHandler } from './handlers/ticket-inline-command.handler';
import { TicketInlineModalHandler } from './handlers/ticket-inline-modal.handler';
import { TicketPayloadCommandHandler } from './handlers/ticket-payload-command.handler';
import { TicketPayloadModalHandler } from './handlers/ticket-payload-modal.handler';

@Module({
  providers: [ModalService, SelectService],
  commands: [TicketCommand],
  handlers: [
    TicketInlineCommandHandler,
    TicketCategoryInlineSelectHandler,
    TicketInlineModalHandler,
    TicketPayloadCommandHandler,
    TicketCategoryPayloadSelectHandler,
    TicketPayloadModalHandler,
  ],
})
export class TicketModule {}
