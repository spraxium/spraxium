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

export interface SlashBaseOptionConfig {
  description: string;
  required?: boolean;
}

export interface SlashStringOptionConfig extends SlashBaseOptionConfig {
  minLength?: number;
  maxLength?: number;
  choices?: SlashOptionChoice<string>[];
  autocomplete?: boolean;
}

export interface SlashIntegerOptionConfig extends SlashBaseOptionConfig {
  min?: number;
  max?: number;
  choices?: SlashOptionChoice<number>[];
  autocomplete?: boolean;
}

export interface SlashNumberOptionConfig extends SlashBaseOptionConfig {
  min?: number;
  max?: number;
  autocomplete?: boolean;
}

export interface SlashChannelOptionConfig extends SlashBaseOptionConfig {
  channelTypes?: number[];
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
  choices?: SlashOptionChoice[];
  channelTypes?: number[];
}
