import 'reflect-metadata';
import { METADATA_KEYS } from '@spraxium/common';
import type { ButtonComponentMeta, DynamicButtonConfig } from '../interfaces';

/**
 * Class decorator that registers a dynamic button component with a prefix based custom ID.
 *
 * @param config Dynamic button appearance and prefix configuration
 */
export function DynamicButton(config: DynamicButtonConfig): ClassDecorator {
  return (target): void => {
    const meta: ButtonComponentMeta = { isLink: false, isDynamic: true, ...config };
    Reflect.defineMetadata(METADATA_KEYS.DYNAMIC_BUTTON_COMPONENT, meta, target);
  };
}
