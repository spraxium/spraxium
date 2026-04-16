import { Module } from '@spraxium/common';
import { ModalService } from '@spraxium/components';
import { TicketCommand } from './commands/ticket.command';
import { TicketEditHandler } from './handlers/ticket-edit.handler';
import { TicketModalHandler } from './handlers/ticket-modal.handler';
import { TicketOpenHandler } from './handlers/ticket-open.handler';

@Module({
  providers: [ModalService],
  commands: [TicketCommand],
  handlers: [
    TicketOpenHandler, // /ticket open  — build()
    TicketEditHandler, // /ticket edit  — buildFor() with cache pre-fill
    TicketModalHandler, // handles TicketModal submission + validation
  ],
})
export class TicketModule {}
