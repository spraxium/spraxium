import { SlashCommand, SlashSubcommand } from '@spraxium/common';

@SlashCommand({
  name: 'ticket',
  description: 'Demonstrates @ModalParams() and @ModalPayload() on modal handlers.',
})
export class TicketCommand {
  @SlashSubcommand({
    name: 'inline',
    description: 'Select a category then submit a ticket form — params via inline encoding.',
  })
  inline() {}

  @SlashSubcommand({
    name: 'payload',
    description: 'Select a category then submit a ticket form — payload via store encoding.',
  })
  payload() {}
}
