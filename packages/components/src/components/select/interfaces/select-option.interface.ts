export interface SelectEmojiObject {
  id?: string;
  name?: string;
  animated?: boolean;
}

export type SelectEmojiConfig = string | SelectEmojiObject;

export interface SelectOptionConfig {
  label: string;
  value: string;
  description?: string;
  default?: boolean;
  emoji?: SelectEmojiConfig;
}
