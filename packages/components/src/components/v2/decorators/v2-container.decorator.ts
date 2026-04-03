import 'reflect-metadata';
import { COMPONENT_METADATA_KEYS } from '../../../component-metadata-keys';
import type { V2ChildDef, V2ContainerMeta } from '../interfaces';

/**
 * Class decorator that marks a class as a V2 message container.
 * Child elements are registered via property decorators such as `@V2Text`, `@V2Section`, etc.
 *
 * @param config Optional accent color and spoiler settings
 */
export function V2Container(config: V2ContainerMeta = {}): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(COMPONENT_METADATA_KEYS.V2_CONTAINER, config, target);
    if (!Reflect.hasMetadata(COMPONENT_METADATA_KEYS.V2_CHILDREN, target)) {
      Reflect.defineMetadata(COMPONENT_METADATA_KEYS.V2_CHILDREN, [], target);
    }
  };
}
