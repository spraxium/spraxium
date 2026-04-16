import {
  SlashCommand,
  SlashOption,
  SlashSubcommand,
  SlashSubcommandGroup,
  SlashSubcommandGroups,
} from '@spraxium/common';

@SlashSubcommandGroup({ name: 'settings', description: 'Adjust server configuration.' })
export class ServerSettingsGroup {
  @SlashOption.String('prefix', { description: 'New command prefix', required: true, maxLength: 5 })
  @SlashSubcommand({ name: 'prefix', description: 'Change the command prefix' })
  prefix() {}

  @SlashOption.String('locale', { description: 'Locale code, e.g. en-US', required: true, maxLength: 10 })
  @SlashSubcommand({ name: 'language', description: 'Change the server language' })
  language() {}
}

@SlashSubcommandGroups([ServerSettingsGroup])
@SlashCommand({ name: 'server', description: 'Server information and settings.' })
export class ServerCommand {
  @SlashSubcommand({ name: 'info', description: 'Display general server information' })
  info() {}

  @SlashSubcommand({ name: 'icon', description: 'Show the server icon' })
  icon() {}
}
