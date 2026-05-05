import { SlashCommand, SlashSubcommand } from '@spraxium/common';

@SlashCommand({
  name: 'showcase',
  description: 'Showcases each @spraxium/i18n component builder in isolation.',
})
export class ShowcaseCommand {
  @SlashSubcommand({ name: 'embed', description: 'buildLocalizedEmbed localized embed schema.' })
  embed() {}

  @SlashSubcommand({ name: 'button', description: 'buildLocalizedButton localized button row.' })
  button() {}

  @SlashSubcommand({ name: 'select', description: 'buildLocalizedSelect localized string select.' })
  select() {}

  @SlashSubcommand({ name: 'modal', description: 'buildLocalizedModal localized modal dialog.' })
  modal() {}

  @SlashSubcommand({ name: 'v2', description: 'buildLocalizedV2 localized V2 container.' })
  v2() {}
}
