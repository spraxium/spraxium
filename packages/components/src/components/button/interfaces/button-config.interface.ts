import type { ButtonStyleName } from '../types';
import type { ButtonEmojiConfig } from './button-emoji.interface';

export interface ButtonConfig {
  customId: string;
  label: string;
  style?: ButtonStyleName;
  emoji?: ButtonEmojiConfig;
  disabled?: boolean;
}

export interface LinkButtonConfig {
  url: string;
  label: string;
  emoji?: ButtonEmojiConfig;
  disabled?: boolean;
}
