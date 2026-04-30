import 'reflect-metadata';
import { COMPONENT_METADATA_KEYS } from '../../../component-metadata-keys.constant';
import type { AnyConstructor } from '../../../types';
import type { DynamicSelectHandlerMeta } from '../interfaces';

/**
 * Class decorator that links a handler to a `@DynamicStringSelect()` component.
 * The handler's `handle()` method may accept `@Ctx()`, `@FlowContext()`,
 * `@SelectedValues()` and `@SelectPayload()` parameters.
 */
export function DynamicSelectHandler(component: AnyConstructor): ClassDecorator {
  return (target): void => {
    const meta: DynamicSelectHandlerMeta = { component };
    Reflect.defineMetadata(COMPONENT_METADATA_KEYS.SELECT_DYNAMIC_HANDLER, meta, target);
  };
}
