import type { AnyConstructor } from '../../../types';
import type { ButtonConfig, LinkButtonConfig } from './button-config.interface';

export type ButtonComponentMeta =
  | ({ isLink: false } & ButtonConfig)
  | ({ isLink: true } & LinkButtonConfig);

export interface ButtonHandlerMeta {
  component: AnyConstructor;
}
