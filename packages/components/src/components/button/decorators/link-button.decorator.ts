import 'reflect-metadata';
import { COMPONENT_METADATA_KEYS } from '../../../component-metadata-keys';
import type { ButtonComponentMeta, LinkButtonConfig } from '../interfaces';

/**
 * Class decorator that registers a link button component (opens a URL on click).
 *
 * @param config Link button label, URL, and optional emoji configuration
 */
export function LinkButton(config: LinkButtonConfig): ClassDecorator {
  return (target): void => {
    const meta: ButtonComponentMeta = { isLink: true, isDynamic: false, ...config };
    Reflect.defineMetadata(COMPONENT_METADATA_KEYS.BUTTON_COMPONENT, meta, target);
  };
}
