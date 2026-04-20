import { SlashCommand, SlashSubcommand } from '@spraxium/common';

@SlashCommand({
  name: 'flow',
  description: 'Demonstrates the Spraxium FlowContext system.',
})
export class FlowCommand {
  @SlashSubcommand({
    name: 'confirm',
    description: 'Confirm or cancel a destructive action, one-shot, user-scoped.',
  })
  confirm() {}

  @SlashSubcommand({
    name: 'wizard',
    description: 'Multi-step report wizard that carries state across interactions.',
  })
  wizard() {}
}
