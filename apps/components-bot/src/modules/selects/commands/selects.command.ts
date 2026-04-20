import { SlashCommand, SlashSubcommand } from '@spraxium/common';

@SlashCommand({
  name: 'selects',
  description: 'Demonstrates select menu types from @spraxium/components.',
})
export class SelectsCommand {
  @SlashSubcommand({
    name: 'string',
    description: 'Single-choice string select: pick a topic.',
  })
  string() {}

  @SlashSubcommand({
    name: 'multi',
    description: 'Multi-choice string select (1-3 items): affected areas.',
  })
  multi() {}

  @SlashSubcommand({
    name: 'types',
    description: 'Shows all five select types: string, user, role, channel, mentionable.',
  })
  types() {}
}
