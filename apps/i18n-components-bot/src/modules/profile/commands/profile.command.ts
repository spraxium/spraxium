import { SlashCommand, SlashSubcommand } from '@spraxium/common';

@SlashCommand({
  name: 'profile',
  description: 'View or edit your profile.',
})
export class ProfileCommand {
  @SlashSubcommand({ name: 'view', description: 'View your profile card.' })
  view() {}

  @SlashSubcommand({ name: 'edit', description: 'Edit your profile details.' })
  edit() {}
}
