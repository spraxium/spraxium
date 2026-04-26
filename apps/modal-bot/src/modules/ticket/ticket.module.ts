import { Module } from '@spraxium/common';
import { ModalService } from '@spraxium/components';
import { TicketCommand } from './commands/ticket.command';
import { TicketEditCommandHandler } from './handlers/ticket-edit-command.handler';
import { TicketModalSubmitCommandHandler } from './handlers/ticket-modal-submit-command.handler';
import { TicketOpenCommandHandler } from './handlers/ticket-open-command.handler';

@Module({
  providers: [ModalService],
  commands: [TicketCommand],
  handlers: [TicketOpenCommandHandler, TicketEditCommandHandler, TicketModalSubmitCommandHandler],
})
export class TicketModule {}
