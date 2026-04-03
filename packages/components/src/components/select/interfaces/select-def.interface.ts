import type { ChannelType } from 'discord.js';
import type { SelectType } from '../types';
import type { SelectOptionConfig } from './select-option.interface';

export interface SelectDef {
  type: SelectType;
  customId: string;
  placeholder?: string;
  minValues?: number;
  maxValues?: number;
  disabled?: boolean;
  channelTypes?: Array<ChannelType>;
  options: Array<SelectOptionConfig>;
}
