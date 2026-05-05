import type { ChannelType } from 'discord.js';
import type { SelectI18nKeys } from '../../../interfaces';
import type { SelectOptionConfig } from './select-option.interface';

export interface SelectBaseConfig {
  customId: string;
  placeholder?: string;
  minValues?: number;
  maxValues?: number;
  disabled?: boolean;
  /** i18n key overrides resolved at render time via `buildLocalizedSelect()`. */
  i18n?: SelectI18nKeys;
}

export interface StringSelectConfig extends SelectBaseConfig {
  // biome-ignore lint/suspicious/noExplicitAny: generic callable type required
  dynamicOptions?: (data: any) => Array<SelectOptionConfig> | Promise<Array<SelectOptionConfig>>;
}

export type UserSelectConfig = SelectBaseConfig;
export type RoleSelectConfig = SelectBaseConfig;
export type MentionableSelectConfig = SelectBaseConfig;

export interface ChannelSelectConfig extends SelectBaseConfig {
  channelTypes?: Array<ChannelType>;
}
