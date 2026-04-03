import 'reflect-metadata';
import { METADATA_KEYS } from '@spraxium/common';
import type { ButtonComponentMeta, ButtonConfig } from '../interfaces';

/**
 * Class decorator that registers a static button component.
 *
 * @param config Button appearance and behavior configuration
 */
export function Button(config: ButtonConfig): ClassDecorator {
  return (target): void => {
    const meta: ButtonComponentMeta = { isLink: false, isDynamic: false, ...config };
    Reflect.defineMetadata(METADATA_KEYS.BUTTON_COMPONENT, meta, target);
  };
}
