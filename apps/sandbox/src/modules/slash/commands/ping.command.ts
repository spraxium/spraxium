import { SlashCommand, SlashOption } from '@spraxium/common';

@SlashCommand({
  name: 'ping',
  description: 'Check bot latency or ping a specific service.',
})
export class PingCommand {
  @SlashOption.String('service', {
    description: 'Service to check latency for',
    required: false,
    autocomplete: true,
  })
  build() {}
}
