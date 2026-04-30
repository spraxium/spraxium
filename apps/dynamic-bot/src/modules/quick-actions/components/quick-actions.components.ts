import { Button, SelectOption, StringSelect } from '@spraxium/components';

@Button({ customId: 'qa-refresh', label: 'Refresh', style: 'primary', emoji: '🔄' })
export class RefreshButton {}

@Button({ customId: 'qa-export', label: 'Export', style: 'secondary', emoji: '📤' })
export class ExportButton {}

@Button({ customId: 'qa-share', label: 'Share', style: 'secondary', emoji: '🔗' })
export class ShareButton {}

@Button({ customId: 'qa-archive', label: 'Archive', style: 'secondary', emoji: '📦' })
export class ArchiveButton {}

@Button({ customId: 'qa-delete', label: 'Delete', style: 'danger', emoji: '🗑️' })
export class DeleteButton {}

@Button({ customId: 'qa-pin', label: 'Pin', style: 'secondary', emoji: '📌' })
export class PinButton {}

@Button({ customId: 'qa-mute', label: 'Mute', style: 'secondary', emoji: '🔇' })
export class MuteButton {}

@SelectOption({ label: 'Edit', value: 'edit', emoji: '✏️' })
@SelectOption({ label: 'Review', value: 'review', emoji: '👀' })
@SelectOption({ label: 'Approve', value: 'approve', emoji: '✅' })
@StringSelect({
  customId: 'qa-mode',
  placeholder: 'Pick a workflow mode',
  minValues: 1,
  maxValues: 1,
})
export class ModeSelect {}
