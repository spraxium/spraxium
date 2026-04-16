import { SlashCommand, SlashOption, SlashSubcommand } from '@spraxium/common';

@SlashCommand({
  name: 'greet',
  description: 'Greet yourself or another user.',
  i18n: {
    name: 'commands.greet.name',
    description: 'commands.greet.description',
  },
})
export class GreetCommand {
  @SlashSubcommand({
    name: 'me',
    description: 'Greet yourself in your preferred language.',
    i18n: {
      name: 'commands.greet.me.name',
      description: 'commands.greet.me.description',
    },
  })
  me() {}

  @SlashOption.User('target', {
    description: 'The user to greet.',
    required: true,
    i18n: {
      name: 'commands.greet.user.options.target.name',
      description: 'commands.greet.user.options.target.description',
    },
  })
  @SlashSubcommand({
    name: 'user',
    description: 'Greet another user.',
    i18n: {
      name: 'commands.greet.user.name',
      description: 'commands.greet.user.description',
    },
  })
  user() {}
}
