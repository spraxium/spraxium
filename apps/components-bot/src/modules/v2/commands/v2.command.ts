import { SlashCommand, SlashSubcommand } from '@spraxium/common';

@SlashCommand({
  name: 'v2',
  description: 'Demonstrates V2 message components from @spraxium/components.',
})
export class V2Command {
  @SlashSubcommand({
    name: 'fluent',
    description: 'Builds a V2 container using the fluent builder API.',
  })
  fluent() {}

  @SlashSubcommand({
    name: 'class',
    description: 'Builds a V2 container from a decorated schema class.',
  })
  class() {}

  @SlashSubcommand({
    name: 'dynamic',
    description: 'Builds a V2 container with dynamic runtime entries.',
  })
  dynamic() {}
}
