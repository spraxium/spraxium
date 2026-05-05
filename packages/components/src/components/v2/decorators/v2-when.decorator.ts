import 'reflect-metadata';
import { COMPONENT_METADATA_KEYS } from '../../../component-metadata-keys.constant';
import type { V2ChildDef } from '../interfaces';

/**
 * Property decorator that conditionally includes a V2 child based on runtime data.
 * Can be placed above or below the child decorator (e.g. `@V2Text`, `@V2Section`).
 *
 * With `experimentalDecorators` decorators run bottom-up, so scanning
 * `V2_CHILDREN` at decoration time would fail when `@V2When` is placed above
 * the child decorator (child not yet registered). Instead, the predicate is
 * stored under `V2_WHEN` keyed by property name, and `V2Service.sortedChildren`
 * merges it when building the component tree - making decorator order irrelevant.
 *
 * @param predicate Function that returns true to include the child
 */
export function V2When(predicate: NonNullable<V2ChildDef['when']>): PropertyDecorator {
  return (target, propertyKey) => {
    const pending: Map<string, NonNullable<V2ChildDef['when']>> = Reflect.getMetadata(
      COMPONENT_METADATA_KEYS.V2_WHEN,
      target.constructor,
    ) ?? new Map();
    pending.set(String(propertyKey), predicate);
    Reflect.defineMetadata(COMPONENT_METADATA_KEYS.V2_WHEN, pending, target.constructor);
  };
}
