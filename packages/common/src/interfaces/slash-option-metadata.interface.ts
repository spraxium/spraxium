export type SlashOptionType =
  | 'STRING'
  | 'INTEGER'
  | 'NUMBER'
  | 'BOOLEAN'
  | 'USER'
  | 'CHANNEL'
  | 'ROLE'
  | 'MENTIONABLE'
  | 'ATTACHMENT';

export interface SlashOptionChoice<V extends string | number = string | number> {
  name: string;
  value: V;
}

import type { SlashI18nKeys } from './slash-i18n-keys.interface';

export interface SlashBaseOptionConfig {
  description: string;
  required?: boolean;
  i18n?: SlashI18nKeys;
}

export interface SlashStringOptionConfig extends SlashBaseOptionConfig {
  minLength?: number;
  maxLength?: number;
  choices?: Array<SlashOptionChoice<string>>;
  autocomplete?: boolean;
}

export interface SlashIntegerOptionConfig extends SlashBaseOptionConfig {
  min?: number;
  max?: number;
  choices?: Array<SlashOptionChoice<number>>;
  autocomplete?: boolean;
}

export interface SlashNumberOptionConfig extends SlashBaseOptionConfig {
  min?: number;
  max?: number;
  autocomplete?: boolean;
}

/**
 * Valid Discord channel types accepted by slash command channel options.
 * Mirrors the subset that discord.js's `addChannelTypes` allows.
 *
 * Values map to `ChannelType` enum members:
 * 0=GuildText, 2=GuildVoice, 4=GuildCategory, 5=GuildAnnouncement,
 * 10=AnnouncementThread, 11=PublicThread, 12=PrivateThread,
 * 13=GuildStageVoice, 15=GuildForum, 16=GuildMedia
 */
export type GuildChannelType = 0 | 2 | 4 | 5 | 10 | 11 | 12 | 13 | 15 | 16;

export interface SlashChannelOptionConfig extends SlashBaseOptionConfig {
  channelTypes?: Array<GuildChannelType>;
}

export interface SlashOptionMetadata {
  type: SlashOptionType;
  name: string;
  description: string;
  required: boolean;
  autocomplete: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  choices?: Array<SlashOptionChoice>;
  channelTypes?: Array<GuildChannelType>;
  i18n?: SlashI18nKeys;
}
