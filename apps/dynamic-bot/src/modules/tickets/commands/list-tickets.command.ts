import { SlashCommand } from '@spraxium/common';

@SlashCommand({
  name: 'ticket-list',
  description: 'Demo: list open tickets stored in the JSON DB.',
})
export class ListTicketsCommand {}
