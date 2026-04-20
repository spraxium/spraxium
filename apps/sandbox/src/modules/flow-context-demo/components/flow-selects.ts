import { StringSelect, SelectOption } from '@spraxium/components';

@StringSelect({
  customId: 'flow_wizard_category',
  placeholder: 'Choose a category…',
})
@SelectOption({
  label: '🐛 Bug',
  value: 'bug',
  description: 'Something is broken',
})
@SelectOption({
  label: '✨ Feature',
  value: 'feature',
  description: 'New idea or improvement',
})
@SelectOption({
  label: '📚 Docs',
  value: 'docs',
  description: 'Documentation issue',
})
@SelectOption({
  label: '❓ Question',
  value: 'question',
  description: 'General question',
})
export class FlowCategorySelect {}
