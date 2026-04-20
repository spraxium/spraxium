import { SlashCommand, SlashSubcommand } from '@spraxium/common';

@SlashCommand({
  name: 'component-demo',
  description: 'Demonstrates @spraxium/components select menus and buttons',
})
export class ComponentDemoCommand {
  @SlashSubcommand({
    name: 'selects',
    description: 'Shows an embed with all five select menu types',
  })
  selects() {}

  @SlashSubcommand({
    name: 'buttons',
    description: 'Shows an embed with all button styles (primary, secondary, success, danger, link, disabled)',
  })
  buttons() {}

  @SlashSubcommand({
    name: 'ticket-panel',
    description: 'Shows a realistic ticket panel combining embed + select + buttons',
  })
  ticketPanel() {}
}
