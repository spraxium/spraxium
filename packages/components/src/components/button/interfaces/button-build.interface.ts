import type { ButtonStyleName } from '../types';
import type { ButtonEmojiConfig } from './button-emoji.interface';

export interface ButtonBuildOverrides {
  label?: string;
  style?: ButtonStyleName;
  emoji?: ButtonEmojiConfig;
  disabled?: boolean;
}
