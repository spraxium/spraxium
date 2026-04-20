import {
  SlashCommand,
  SlashOption,
  SlashSubcommand,
  SlashSubcommandGroup,
  SlashSubcommandGroups,
} from '@spraxium/common';
import { ChannelType } from 'discord.js';

@SlashSubcommandGroup({
  name: 'moderation',
  description: 'Moderation settings',
})
export class ModerationGroup {
  @SlashOption.Boolean('enabled', { description: 'Enable or disable automod', required: true })
  @SlashOption.String('filter', { description: 'Filter profile to apply', required: false })
  @SlashSubcommand({
    name: 'automod',
    description: 'Configure automod filters',
  })
  automod() {}

  @SlashOption.Channel('channel', {
    description: 'Channel to send moderation logs to',
    required: true,
    channelTypes: [ChannelType.GuildText],
  })
  @SlashSubcommand({
    name: 'logging',
    description: 'Configure moderation logging channel',
  })
  logging() {}
}

@SlashSubcommandGroup({
  name: 'welcome',
  description: 'Welcome system settings',
})
export class WelcomeGroup {
  @SlashOption.Channel('channel', {
    description: 'Channel to send welcome messages to',
    required: true,
    channelTypes: [ChannelType.GuildText],
  })
  @SlashSubcommand({ name: 'channel', description: 'Set the welcome channel' })
  setChannel() {}

  @SlashOption.String('template', {
    description: 'Welcome message template',
    required: true,
    maxLength: 2000,
  })
  @SlashSubcommand({
    name: 'message',
    description: 'Set the welcome message template',
  })
  message() {}
}

@SlashSubcommandGroups([ModerationGroup, WelcomeGroup])
@SlashCommand({
  name: 'config',
  description: 'Server configuration commands.',
  defaultMemberPermissions: 0x20n,
})
export class ConfigCommand {
  @SlashSubcommand({
    name: 'view',
    description: 'View the current server configuration',
  })
  view() {}

  @SlashSubcommand({
    name: 'reset',
    description: 'Reset configuration to defaults',
  })
  reset() {}
}
