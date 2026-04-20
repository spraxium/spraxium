import { SlashCommand, SlashSubcommand } from '@spraxium/common';

@SlashCommand({
  name: 'modal',
  description: 'Demonstrates @spraxium/components modal features.',
})
export class ModalCommand {
  @SlashSubcommand({
    name: 'feedback',
    description: 'Opens a simple two-field feedback modal.',
  })
  feedback() {}

  @SlashSubcommand({
    name: 'report',
    description: 'Opens a report modal with field validation and submission cache.',
  })
  report() {}
}
