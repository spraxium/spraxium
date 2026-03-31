import type { SlashI18nKeys } from './slash-i18n-keys.interface';

export interface SlashSubcommandMetadata {
  name: string;
  description: string;
  i18n?: SlashI18nKeys;
}

export interface SlashSubcommandGroupMetadata {
  name: string;
  description: string;
  i18n?: SlashI18nKeys;
}
