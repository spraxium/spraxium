export interface SelectEmojiObject {
  id?: string;
  name?: string;
  animated?: boolean;
}

export type SelectEmojiConfig = string | SelectEmojiObject;

import type { SelectOptionI18nKeys } from '../../../interfaces';

export interface SelectOptionConfig {
  label: string;
  value: string;
  description?: string;
  default?: boolean;
  emoji?: SelectEmojiConfig;
  /** i18n key overrides resolved at render time via `buildLocalizedSelect()`. */
  i18n?: SelectOptionI18nKeys;
}
