import 'reflect-metadata';
import { COMPONENT_METADATA_KEYS } from '../../../component-metadata-keys.constant';
import type { ButtonComponentMeta, ButtonConfig } from '../interfaces';

/**
 * Class decorator that registers a static button component.
 *
 * @param config Button appearance and behavior configuration
 */
export function Button(config: ButtonConfig): ClassDecorator {
  return (target): void => {
    const meta: ButtonComponentMeta = { isLink: false, ...config };
    Reflect.defineMetadata(COMPONENT_METADATA_KEYS.BUTTON_COMPONENT, meta, target);
  };
}
