import { SlashCommand, SlashSubcommand } from '@spraxium/common';

@SlashCommand({
  name: 'ticket',
  description: 'Manage support tickets.',
})
export class TicketCommand {
  @SlashSubcommand({
    name: 'open',
    description: 'Open a new support ticket.',
  })
  open() {}

  @SlashSubcommand({
    name: 'edit',
    description: 'Edit your ticket — previous answers are pre-filled from cache.',
  })
  edit() {}
}
