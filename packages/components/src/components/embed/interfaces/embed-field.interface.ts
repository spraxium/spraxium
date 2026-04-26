import type { EmbedFieldI18nKeys } from '../../../interfaces';

export interface EmbedFieldDef {
  propertyKey: string;
  order: number;
  name: string | ((data: unknown) => string);
  value: string | ((data: unknown) => string);
  inline?: boolean;
  i18n?: EmbedFieldI18nKeys;
}

export interface EmbedDescriptionDef {
  propertyKey: string;
  value: string | ((data: unknown) => string | { toString(): string });
}
