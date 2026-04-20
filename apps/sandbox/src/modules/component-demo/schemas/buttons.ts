import { Button, LinkButton } from '@spraxium/components';

@Button({ customId: 'demo_primary', label: 'Primary', style: 'primary' })
export class PrimaryButton {}

@Button({ customId: 'demo_secondary', label: 'Secondary', style: 'secondary' })
export class SecondaryButton {}

@Button({
  customId: 'demo_success',
  label: 'Approve',
  style: 'success',
  emoji: '✅',
})
export class ApproveButton {}

@Button({
  customId: 'demo_danger',
  label: 'Delete',
  style: 'danger',
  emoji: '🗑️',
})
export class DeleteButton {}

@LinkButton({
  label: 'GitHub',
  url: 'https://github.com/spraxium/spraxium',
  emoji: '🔗',
})
export class GitHubLinkButton {}

@Button({
  customId: 'demo_disabled',
  label: 'Disabled',
  style: 'secondary',
  disabled: true,
})
export class DisabledButton {}

@Button({
  customId: 'ticket_open',
  label: 'Open Ticket',
  style: 'success',
  emoji: '🎫',
})
export class OpenTicketButton {}

@Button({
  customId: 'ticket_close',
  label: 'Close',
  style: 'danger',
  emoji: '🔒',
})
export class CloseTicketButton {}

@LinkButton({
  label: 'Docs',
  url: 'https://spraxium.dev/guide/getting-started',
  emoji: '📖',
})
export class DocsLinkButton {}
