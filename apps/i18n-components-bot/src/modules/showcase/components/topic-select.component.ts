import { SelectOption, StringSelect } from '@spraxium/components';

@StringSelect({
  customId: 'showcase_topic',
  placeholder: 'Pick a topic…',
  minValues: 1,
  maxValues: 1,
  i18n: { placeholder: 'commands.components.showcase.select.placeholder' },
})
@SelectOption({
  label: '🔧 Development',
  value: 'dev',
  description: 'Code and architecture topics',
  i18n: {
    label: 'commands.components.showcase.select.options.dev.label',
    description: 'commands.components.showcase.select.options.dev.description',
  },
})
@SelectOption({
  label: '🚀 Operations',
  value: 'ops',
  description: 'Deployment and infra topics',
  i18n: {
    label: 'commands.components.showcase.select.options.ops.label',
    description: 'commands.components.showcase.select.options.ops.description',
  },
})
@SelectOption({
  label: '🎨 Design / UX',
  value: 'ux',
  description: 'UI and experience topics',
  i18n: {
    label: 'commands.components.showcase.select.options.ux.label',
    description: 'commands.components.showcase.select.options.ux.description',
  },
})
export class TopicSelect {}
