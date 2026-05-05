import type { ButtonI18nKeys } from '../../../interfaces';
import type { ButtonStyleName } from '../types';
import type { ButtonEmojiConfig } from './button-emoji.interface';

export interface ButtonConfig {
  customId: string;
  label: string;
  style?: ButtonStyleName;
  emoji?: ButtonEmojiConfig;
  disabled?: boolean;
  /** i18n key overrides resolved at render time via `buildLocalizedButton()`. */
  i18n?: ButtonI18nKeys;
}

export interface LinkButtonConfig {
  url: string;
  label: string;
  emoji?: ButtonEmojiConfig;
  disabled?: boolean;
  /** i18n key overrides resolved at render time via `buildLocalizedButton()`. */
  i18n?: ButtonI18nKeys;
}
