import { SlashCommand } from '@spraxium/common';

@SlashCommand({
  name: 'filter',
  description: 'Demo: inline-encoded dynamic select (@DynamicStringSelect + @SelectParams).',
})
export class FilterCommand {
  build() {}
}
