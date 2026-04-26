import type { EmbedFieldI18nKeys } from '../../../interfaces';

export interface EmbedFieldConfig<T = unknown> {
  name: string | ((data: T) => string);
  value: string | ((data: T) => string);
  inline?: boolean;
  i18n?: EmbedFieldI18nKeys;
}
