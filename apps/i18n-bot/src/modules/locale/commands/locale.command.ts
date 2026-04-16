import { SlashCommand, SlashOption, SlashSubcommand } from '@spraxium/common';

@SlashCommand({
  name: 'locale',
  description: 'Manage your language preference.',
  i18n: {
    name: 'commands.locale.name',
    description: 'commands.locale.description',
  },
})
export class LocaleCommand {
  @SlashOption.String('language', {
    description: 'The language to use.',
    required: true,
    choices: [
      { name: 'English (US)', value: 'en-US' },
      { name: 'Português (Brasil)', value: 'pt-BR' },
    ],
    i18n: {
      name: 'commands.locale.set.options.language.name',
      description: 'commands.locale.set.options.language.description',
    },
  })
  @SlashSubcommand({
    name: 'set',
    description: 'Set your preferred language.',
    i18n: {
      name: 'commands.locale.set.name',
      description: 'commands.locale.set.description',
    },
  })
  set() {}

  @SlashSubcommand({
    name: 'info',
    description: 'Show your current locale details.',
    i18n: {
      name: 'commands.locale.info.name',
      description: 'commands.locale.info.description',
    },
  })
  info() {}
}
