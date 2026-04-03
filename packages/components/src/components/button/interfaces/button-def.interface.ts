import type { ButtonStyleName } from '../types';
import type { ButtonEmojiConfig } from './button-emoji.interface';

export interface StaticButtonDef {
  type: 'static';
  customId: string;
  label: string;
  style: ButtonStyleName;
  emoji?: ButtonEmojiConfig;
  disabled?: boolean;
}

export interface LinkButtonDef {
  type: 'link';
  url: string;
  label: string;
  emoji?: ButtonEmojiConfig;
  disabled?: boolean;
}

export interface DynamicButtonDef {
  type: 'dynamic';
  prefix: string;
  data: string;
  label: string;
  style: ButtonStyleName;
  emoji?: ButtonEmojiConfig;
  disabled?: boolean;
}

export type ButtonDef = StaticButtonDef | LinkButtonDef | DynamicButtonDef;
