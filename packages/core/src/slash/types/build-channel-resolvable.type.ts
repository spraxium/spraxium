import type { ChannelType } from 'discord.js';

export type GuildChannelTypeResolvable =
  | ChannelType.GuildText
  | ChannelType.GuildVoice
  | ChannelType.GuildCategory
  | ChannelType.GuildAnnouncement
  | ChannelType.AnnouncementThread
  | ChannelType.PublicThread
  | ChannelType.PrivateThread
  | ChannelType.GuildStageVoice
  | ChannelType.GuildForum
  | ChannelType.GuildMedia;
