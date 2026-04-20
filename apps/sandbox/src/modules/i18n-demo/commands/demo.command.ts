import { SlashCommand, SlashOption, SlashSubcommand } from '@spraxium/common';

@SlashCommand({
  name: 'demo',
  description: 'i18n feature demonstrations',
  i18n: {
    name: 'commands.demo.name',
    description: 'commands.demo.description',
  },
})
export class DemoCommand {

  @SlashSubcommand({
    name: 'translate',
    description: 'Shows t() and tUser() with {{interpolation}} in both locales',
    i18n: {
      name: 'commands.demo.translate.name',
      description: 'commands.demo.translate.description',
    },
  })
  translate() {}

  @SlashOption.Integer('count', {
    description: 'Number of items (try 0, 1, 5)',
    required: true,
    min: 0,
    max: 100,
    i18n: {
      name: 'commands.demo.plural.options.count.name',
      description: 'commands.demo.plural.options.count.description',
    },
  })
  @SlashSubcommand({
    name: 'plural',
    description:
      'Shows tp() and tpUser() — picks items_one or items_other via Intl.PluralRules',
    i18n: {
      name: 'commands.demo.plural.name',
      description: 'commands.demo.plural.description',
    },
  })
  plural() {}

  @SlashSubcommand({
    name: 'locale',
    description:
      'Shows getUserLocale(), getGuildLocale() and resolveLocale() (user → guild → default)',
  })
  locale() {}

  @SlashSubcommand({
    name: 'embed',
    description: 'Builds a fully translated embed with LocalizedEmbedBuilder',
  })
  embed() {}

  @SlashSubcommand({
    name: 'registry',
    description: 'Shows locales(), default() and has() from LocaleRegistry',
  })
  registry() {}

  @SlashSubcommand({
    name: 'slash-info',
    description:
      'Shows the output of buildSlashLocalizations() for this command',
  })
  slashInfo() {}
}
