import { SlashCommand, SlashSubcommand } from '@spraxium/common';

@SlashCommand({
  name: 'embed-demo',
  description: 'Demonstrates @spraxium/components embed features',
})
export class EmbedDemoCommand {
  @SlashSubcommand({
    name: 'build',
    description: 'Builds an embed from a schema class using EmbedService.build()',
  })
  build() {}

  @SlashSubcommand({
    name: 'paginator',
    description: 'Shows EmbedService.paginator() with automatic nav buttons',
  })
  paginator() {}

  @SlashSubcommand({
    name: 'data',
    description: 'Shows EmbedService.paginateData() — one page per data item',
  })
  data() {}
}
