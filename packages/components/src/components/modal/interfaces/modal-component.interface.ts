import type { ModalI18nKeys } from '../../../interfaces';

export interface ModalComponentMetadata {
  id: string;
  title: string;
  /** i18n key overrides resolved at render time via `buildLocalizedModal()`. */
  i18n?: ModalI18nKeys;
}

export interface ModalHandlerMetadata {
  builder: new (
    // biome-ignore lint/suspicious/noExplicitAny: any class is valid as a builder reference
    ...args: Array<any>
  ) => object;
}
