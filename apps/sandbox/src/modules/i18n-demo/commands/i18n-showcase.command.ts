import { SlashCommand, SlashOption, SlashSubcommand, SlashSubcommandGroup, SlashSubcommandGroups } from '@spraxium/common';
import { ChannelType } from 'discord.js';

@SlashSubcommandGroup({
  name: 'moderation',
  description: 'Moderation settings',
})
export class ModerationGroup {
  @SlashOption.Boolean('enabled', { description: 'Enable or disable automod', required: true })
  @SlashOption.String('filter', { description: 'Filter profile to apply', required: false })
  @SlashSubcommand({ name: 'automod', description: 'Configure automod filters' })
  automod() {}

  @SlashOption.Channel('channel', {
    description: 'Channel to send moderation logs to',
    required: true,
    channelTypes: [ChannelType.GuildText],
  })
  @SlashSubcommand({ name: 'logging', description: 'Configure moderation logging channel' })
  logging() {}
}

@SlashSubcommandGroups([ModerationGroup])
@SlashCommand({
  name: 'i18n-showcase',
  description: 'Complete @spraxium/i18n feature showcase',
  i18n: {
    name: 'commands.demo.name',
    description: 'commands.demo.description',
  },
})
export class I18nShowcaseCommand {
  @SlashOption.Integer('count', {
    description: 'Number for pluralization demo',
    required: false,
    min: 0,
    max: 100,
  })
  @SlashSubcommand({
    name: 'overview',
    description: 'All i18n features in one response: t(), tp(), embeds, slash localizations',
  })
  overview() {}

  @SlashSubcommand({
    name: 'store',
    description: 'Store resolution: getUserLocale, getGuildLocale, resolveLocale, tUser, tpUser',
  })
  store() {}
}
