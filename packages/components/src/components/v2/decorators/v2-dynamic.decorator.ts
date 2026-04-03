import type { V2DynamicConfig } from '../interfaces';
import { registerChild } from './register-child';

/**
 * Property decorator that registers a dynamic child factory within a V2 container.
 * The factory receives runtime data and returns an array of child specs.
 *
 * @param factory Function that produces child specifications from runtime data
 */
export function V2Dynamic(factory: V2DynamicConfig['factory']): PropertyDecorator {
  return (target, propertyKey) => {
    registerChild(target, String(propertyKey), {
      type: 'dynamic',
      config: { factory } satisfies V2DynamicConfig,
    });
  };
}
