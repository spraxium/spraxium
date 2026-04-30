import { SlashCommand } from '@spraxium/common';

@SlashCommand({
  name: 'topics',
  description: 'Demo: dynamic string selects (@DynamicStringSelect + @SelectPayload).',
})
export class TopicsCommand {
  build() {}
}
