import { Module } from '@spraxium/common';
import { ListTicketsCommand } from './commands/list-tickets.command';
import { OpenTicketCommand } from './commands/open-ticket.command';
import { AssignTicketButtonHandler } from './handlers/assign-ticket-button.handler';
import { CloseTicketButtonHandler } from './handlers/close-ticket-button.handler';
import { ListTicketsHandler } from './handlers/list-tickets.handler';
import { OpenTicketHandler } from './handlers/open-ticket.handler';
import { TicketsRepository } from './tickets.repository';

/**
 * Demo module showcasing the full new dynamic-button system end-to-end:
 *
 *   /ticket-open subject:<text>   – creates a ticket persisted in tickets.json,
 *                                   renders an inline-encoded close button and a
 *                                   store-encoded assign button (ref tracked in DB).
 *   /ticket-list                  – lists open tickets.
 *
 *   Assign click  -> store payload + @PayloadRef (ref kept for revocation).
 *   Close click   -> @ButtonParams<{ id }>() (inline) + ButtonPayloadService.revokeMany().
 */
@Module({
  providers: [TicketsRepository],
  commands: [OpenTicketCommand, ListTicketsCommand],
  handlers: [OpenTicketHandler, ListTicketsHandler, AssignTicketButtonHandler, CloseTicketButtonHandler],
})
export class TicketsModule {}
