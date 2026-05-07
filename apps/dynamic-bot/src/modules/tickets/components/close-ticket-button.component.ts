import { DynamicButton } from '@spraxium/components';
import type { ButtonRenderConfig } from '@spraxium/components';
import type { Ticket } from '../tickets.data';

/**
 * Inline-encoded close button. The ticket id travels in the customId itself
 * (`close-ticket~id=<ticketId>`), so the button keeps working forever and
 * across bot restarts without any payload TTL.
 */
@DynamicButton({ baseId: 'close-ticket', encoding: 'inline' })
export class CloseTicketButton {
  static render(ticket: Ticket): ButtonRenderConfig {
    return {
      label: 'Close ticket',
      style: 'danger',
      emoji: '🔒',
      params: { id: ticket.id },
    };
  }
}
