import 'reflect-metadata';
import { COMPONENT_METADATA_KEYS } from '../../../component-metadata-keys.constant';
import type { AnyConstructor } from '../../../types';
import type { DynamicButtonHandlerMeta } from '../interfaces';

/**
 * Class decorator that links a handler to a `@DynamicButton()` component.
 * The handler's `handle()` method may accept `@Ctx()`, `@FlowContext()` and
 * `@ButtonPayload()` / `@PayloadRef()` (store mode) or `@ButtonParams()`
 * (inline mode) parameters.
 */
export function DynamicButtonHandler(component: AnyConstructor): ClassDecorator {
  return (target): void => {
    const meta: DynamicButtonHandlerMeta = { component };
    Reflect.defineMetadata(COMPONENT_METADATA_KEYS.BUTTON_DYNAMIC_HANDLER, meta, target);
  };
}
