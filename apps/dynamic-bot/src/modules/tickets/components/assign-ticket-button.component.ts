import { DynamicButton } from '@spraxium/components';
import type { ButtonRenderConfig } from '@spraxium/components';
import type { Ticket } from '../tickets.data';

/**
 * Store-encoded assign button. The full ticket snapshot is persisted as a
 * payload (24h TTL); the minted ref is tracked in the JSON DB so it can be
 * revoked atomically when the ticket is closed.
 */
@DynamicButton({ baseId: 'assign-ticket', payloadTtl: 60 * 60 * 24 })
export class AssignTicketButton {
  static render(ticket: Ticket): ButtonRenderConfig {
    return {
      label: 'Assign to me',
      style: 'primary',
      emoji: '🙋',
    };
  }
}
