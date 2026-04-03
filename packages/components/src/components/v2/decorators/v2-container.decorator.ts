import 'reflect-metadata';
import { METADATA_KEYS } from '@spraxium/common';
import type { V2ChildDef, V2ContainerMeta } from '../interfaces';

/**
 * Class decorator that marks a class as a V2 message container.
 * Child elements are registered via property decorators such as `@V2Text`, `@V2Section`, etc.
 *
 * @param config Optional accent color and spoiler settings
 */
export function V2Container(config: V2ContainerMeta = {}): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(METADATA_KEYS.V2_CONTAINER, config, target);
    if (!Reflect.hasMetadata(METADATA_KEYS.V2_CHILDREN, target)) {
      Reflect.defineMetadata(METADATA_KEYS.V2_CHILDREN, [], target);
    }
  };
}
