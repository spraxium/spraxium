import { SlashCommand, SlashSubcommand } from '@spraxium/common';

@SlashCommand({
  name: 'v2-demo',
  description: 'Demonstrates @spraxium/components V2 containers',
})
export class V2DemoCommand {
  @SlashSubcommand({
    name: 'fluent',
    description: 'Builds a V2 container with the fluent API',
  })
  fluent() {}

  @SlashSubcommand({
    name: 'class',
    description: 'Builds a V2 container from a decorated class schema',
  })
  class() {}

  @SlashSubcommand({
    name: 'dynamic',
    description: 'Builds a dynamic V2 leaderboard with runtime entries',
  })
  dynamic() {}
}
