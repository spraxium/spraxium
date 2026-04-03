import 'reflect-metadata';
import { COMPONENT_METADATA_KEYS } from '../../../component-metadata-keys';
import type { AnyConstructor } from '../../../types';
import type { ButtonHandlerMeta } from '../interfaces';

/**
 * Class decorator that links a handler to a `@DynamicButton()` component.
 *
 * @param component The dynamic button class this handler responds to
 */
export function DynamicButtonHandler(component: AnyConstructor): ClassDecorator {
  return (target): void => {
    const meta: ButtonHandlerMeta = { component };
    Reflect.defineMetadata(COMPONENT_METADATA_KEYS.DYNAMIC_BUTTON_HANDLER, meta, target);
  };
}
