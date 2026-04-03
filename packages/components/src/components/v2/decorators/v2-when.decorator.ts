import 'reflect-metadata';
import { COMPONENT_METADATA_KEYS } from '../../../component-metadata-keys';
import type { V2ChildDef } from '../interfaces';

/**
 * Property decorator that conditionally includes a V2 child based on runtime data.
 * Applied after the child decorator (e.g. `@V2Text`, `@V2Section`).
 *
 * @param predicate Function that returns true to include the child
 */
export function V2When(predicate: NonNullable<V2ChildDef['when']>): PropertyDecorator {
  return (target, propertyKey) => {
    const children: Array<V2ChildDef> =
      Reflect.getMetadata(COMPONENT_METADATA_KEYS.V2_CHILDREN, target.constructor) ?? [];
    const child = children.find((c) => c.propertyKey === String(propertyKey));
    if (child) child.when = predicate;
  };
}
