import { Module } from '@spraxium/common';
import { ModalService } from '@spraxium/components';
import { TicketCommand } from './commands/ticket.command';
import { TicketEditCommandHandler } from './handlers/ticket-edit-command.handler';
import { TicketModalHandler } from './handlers/ticket-modal.handler';
import { TicketOpenCommandHandler } from './handlers/ticket-open-command.handler';

@Module({
  providers: [ModalService],
  commands: [TicketCommand],
  handlers: [TicketOpenCommandHandler, TicketEditCommandHandler, TicketModalHandler],
})
export class TicketModule {}
