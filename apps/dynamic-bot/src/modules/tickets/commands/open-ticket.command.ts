import { SlashCommand, SlashOption } from '@spraxium/common';

@SlashCommand({
  name: 'ticket-open',
  description: 'Demo: open a support ticket with inline + store dynamic buttons.',
})
export class OpenTicketCommand {
  @SlashOption.String('subject', {
    description: 'What is the ticket about?',
    required: true,
  })
  build() {}
}
