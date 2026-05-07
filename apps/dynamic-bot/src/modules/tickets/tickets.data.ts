/**
 * Domain types for the tickets demo module.
 *
 * The module showcases the new dynamic-button system:
 *   - inline encoding   -> @CloseTicketButton + @ButtonParams<{ id }>()
 *   - store encoding    -> @AssignTicketButton + @ButtonPayload()/@PayloadRef()
 *   - revoking refs     -> ButtonPayloadService.revokeMany() on close
 *
 * Tickets and the payload refs they minted are persisted in a tiny JSON DB
 * (TicketsRepository) so the data survives bot restarts.
 */

export type TicketId = string;

export interface Ticket {
  id: TicketId;
  subject: string;
  openedBy: string;
  openedAt: number;
  assignedTo?: string;
  /**
   * Refs of the persisted "assign" button payloads minted for this ticket.
   * Tracked here so they can be revoked when the ticket is closed.
   */
  assignRefs: string[];
}

export interface TicketsFile {
  tickets: Ticket[];
}
