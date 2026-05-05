import { SlashCommand, SlashOption } from '@spraxium/common';

@SlashCommand({
  name: 'panel',
  description: 'Demo: @V2DynamicRow + @DynamicStringSelect — per-item routing without customId factories.',
})
export class PanelCommand {
  @SlashOption.String('type', {
    description: 'Panel layout',
    required: true,
    choices: [
      { name: 'Select menu', value: 'select' },
      { name: 'Buttons', value: 'buttons' },
    ],
  })
  @SlashOption.Boolean('empty', {
    description: 'Simulate a panel with no categories (empty-state demo)',
    required: false,
  })
  build() {}
}
