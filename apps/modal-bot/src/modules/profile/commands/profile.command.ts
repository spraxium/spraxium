import { SlashCommand, SlashSubcommand } from '@spraxium/common';

@SlashCommand({
  name: 'profile',
  description: 'Manage your server profile.',
})
export class ProfileCommand {
  @SlashSubcommand({
    name: 'setup',
    description: 'Set up your role, timezone and notification preferences.',
  })
  setup() {}
}
