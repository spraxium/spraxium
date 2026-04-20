import { SlashCommand, SlashOption } from '@spraxium/common';
import { buildSlashLocalizations } from '@spraxium/i18n';

@SlashCommand({
  name: 'locale',
  description: 'Change your preferred language.',
  i18n: { name: 'commands.locale.name', description: 'commands.locale.description' },
})
export class LocaleCommand {
  @SlashOption.String('language', {
    description: 'The language to use.',
    required: true,
    i18n: { name: 'commands.locale.options.language.name', description: 'commands.locale.options.language.description' },
    choices: [
      { name: 'English (US)', value: 'en-US' },
      { name: 'Português (Brasil)', value: 'pt-BR' },
    ],
  })
  build() {}
}
