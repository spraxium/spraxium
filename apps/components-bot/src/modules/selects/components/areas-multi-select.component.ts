import { SelectOption, StringSelect } from '@spraxium/components';

@StringSelect({ customId: 'sel_areas', placeholder: 'Choose affected areas…', minValues: 1, maxValues: 3 })
@SelectOption({ label: 'Events', value: 'events', emoji: '⚡' })
@SelectOption({ label: 'HTTP API', value: 'http', emoji: '🌐' })
@SelectOption({ label: 'Docs', value: 'docs', emoji: '📄' })
export class AreasMultiSelect {}
