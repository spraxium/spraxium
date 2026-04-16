import { SlashCommand, SlashOption } from '@spraxium/common';

@SlashCommand({ name: 'color', description: 'Pick a color and shade level.' })
export class ColorCommand {
  @SlashOption.String('name', {
    description: 'Color to pick',
    required: true,
    choices: [
      { name: 'Red', value: 'red' },
      { name: 'Green', value: 'green' },
      { name: 'Blue', value: 'blue' },
      { name: 'Yellow', value: 'yellow' },
      { name: 'Purple', value: 'purple' },
    ],
  })
  @SlashOption.Integer('shade', {
    description: 'Shade level',
    required: false,
    choices: [
      { name: 'Light (100)', value: 100 },
      { name: 'Medium (500)', value: 500 },
      { name: 'Dark (900)', value: 900 },
    ],
  })
  build() {}
}
