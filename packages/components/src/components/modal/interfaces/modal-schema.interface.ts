import type { ModalFieldDef } from './modal-field.interface';

export interface ModalSchema {
  id: string;
  title: string;
  textDisplays: Array<{ content: string }>;
  fields: Array<ModalFieldDef>;
}
