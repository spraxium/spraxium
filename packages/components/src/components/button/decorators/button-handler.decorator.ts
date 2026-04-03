import 'reflect-metadata';
import { COMPONENT_METADATA_KEYS } from '../../../component-metadata-keys.constant';
import type { AnyConstructor } from '../../../types';
import type { ButtonHandlerMeta } from '../interfaces';

/**
 * Class decorator that links a handler to a static `@Button()` component.
 *
 * @param component The button class this handler responds to
 */
export function ButtonHandler(component: AnyConstructor): ClassDecorator {
  return (target): void => {
    const meta: ButtonHandlerMeta = { component };
    Reflect.defineMetadata(COMPONENT_METADATA_KEYS.BUTTON_HANDLER, meta, target);
  };
}
