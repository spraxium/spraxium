import { ChannelSelect } from '@spraxium/components';
import { ChannelType } from 'discord.js';

@ChannelSelect({
  customId: 'sel_channel',
  placeholder: 'Pick a text channel…',
  channelTypes: [ChannelType.GuildText, ChannelType.GuildAnnouncement],
})
export class TextChannelSelect {}
