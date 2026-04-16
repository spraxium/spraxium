import { SlashCommand, SlashOption } from '@spraxium/common';
import { ChannelType } from 'discord.js';

@SlashCommand({ name: 'inspect', description: 'Inspect every slash option type.' })
export class InspectCommand {
  @SlashOption.String('text', { description: 'A plain text value', required: true })
  @SlashOption.Integer('count', { description: 'Whole number (1–100)', required: false, min: 1, max: 100 })
  @SlashOption.Number('ratio', { description: 'Decimal number (0.0–1.0)', required: false, min: 0, max: 1 })
  @SlashOption.Boolean('flag', { description: 'A true/false toggle', required: false })
  @SlashOption.User('target', { description: 'A Discord user', required: false })
  @SlashOption.Channel('channel', {
    description: 'A text channel',
    required: false,
    channelTypes: [ChannelType.GuildText],
  })
  @SlashOption.Role('role', { description: 'A Discord role', required: false })
  @SlashOption.Mentionable('mention', { description: 'A user or role mention', required: false })
  @SlashOption.Attachment('file', { description: 'An uploaded file', required: false })
  build() {}
}
