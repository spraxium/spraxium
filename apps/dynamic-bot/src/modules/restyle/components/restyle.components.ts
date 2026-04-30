import { Button, SelectOption, StringSelect } from '@spraxium/components';

@Button({ customId: 'restyle-save', label: 'Action A', style: 'secondary' })
export class SaveButton {}

@Button({ customId: 'restyle-discard', label: 'Action B', style: 'secondary' })
export class DiscardButton {}

@Button({ customId: 'restyle-archive', label: 'Action C', style: 'secondary' })
export class ArchiveButton {}

@Button({ customId: 'restyle-preview', label: 'Action D', style: 'secondary' })
export class PreviewButton {}

@SelectOption({ label: 'Alpha', value: 'a' })
@SelectOption({ label: 'Beta', value: 'b' })
@SelectOption({ label: 'Gamma', value: 'g' })
@StringSelect({ customId: 'restyle-pick', placeholder: 'Default placeholder', minValues: 1, maxValues: 1 })
export class PickSelect {}
