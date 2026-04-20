import { SlashCommand, SlashSubcommand } from '@spraxium/common';

@SlashCommand({
  name: 'modal-demo',
  description: 'Demonstrates @spraxium/components modal features',
})
export class ModalDemoCommand {
  @SlashSubcommand({
    name: 'feedback',
    description: 'Opens a basic feedback modal (text fields)',
  })
  feedback() {}

  @SlashSubcommand({
    name: 'report',
    description: 'Opens a report modal with validation + cache',
  })
  report() {}

  @SlashSubcommand({
    name: 'dynamic',
    description: 'Opens a modal with dynamic fields and @ModalWhen',
  })
  dynamic() {}

  @SlashSubcommand({
    name: 'select',
    description: 'Opens a modal with select, radio, and checkbox fields',
  })
  select() {}
}
