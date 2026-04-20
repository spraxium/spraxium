import { SlashCommand, SlashSubcommand } from '@spraxium/common';

@SlashCommand({
  name: 'flow-demo',
  description: 'Demonstrates the Spraxium FlowContext system',
})
export class FlowDemoCommand {
  @SlashSubcommand({
    name: 'confirm',
    description: 'Confirm/cancel a destructive action (one-shot context)',
  })
  confirm() {}

  @SlashSubcommand({
    name: 'wizard',
    description: 'Multi-step report wizard that carries state via FlowContext',
  })
  wizard() {}
}
