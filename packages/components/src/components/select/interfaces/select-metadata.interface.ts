import type { ChannelType } from 'discord.js';
import type { AnyConstructor } from '../../../types';
import type { SelectType } from '../types';
import type { SelectOptionConfig } from './select-option.interface';

export interface SelectComponentMeta {
  type: SelectType;
  customId: string;
  placeholder?: string;
  minValues?: number;
  maxValues?: number;
  disabled?: boolean;
  channelTypes?: Array<ChannelType>;
  // biome-ignore lint/suspicious/noExplicitAny: generic callable type required
  dynamicOptions?: (data: any) => Array<SelectOptionConfig> | Promise<Array<SelectOptionConfig>>;
}

export interface SelectHandlerMeta {
  component: AnyConstructor;
}
