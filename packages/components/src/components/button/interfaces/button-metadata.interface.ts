import type { AnyConstructor } from '../../../types';
import type { ButtonConfig } from './button-config.interface';
import type { DynamicButtonConfig, LinkButtonConfig } from './button-config.interface';

export type ButtonComponentMeta =
  | ({ isLink: false; isDynamic: false } & ButtonConfig)
  | ({ isLink: true; isDynamic: false } & LinkButtonConfig)
  | ({ isLink: false; isDynamic: true } & DynamicButtonConfig);

export interface ButtonHandlerMeta {
  component: AnyConstructor;
}
