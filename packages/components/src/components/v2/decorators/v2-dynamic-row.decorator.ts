import type { V2DynamicRowConfig } from '../interfaces';
import { registerChild } from './register-child.helper';

/**
 * Property decorator that registers a dynamic action row child within a V2
 * container. Auto-chunks the produced buttons into multiple rows of up to 5
 * (Discord's per-row limit).
 *
 * Two modes are supported:
 *
 * 1. **Dynamic items** — render N items through a `@DynamicButton` class:
 * ```ts
 * @V2DynamicRow({ dynamic: BookButton, items: (data) => data.books })
 * declare books: never;
 * ```
 *
 * 2. **Static class list** — render a flat list of `@Button` classes:
 * ```ts
 * @V2DynamicRow({ components: (data) => data.actions })
 * declare actions: never;
 * ```
 */
export function V2DynamicRow(config: V2DynamicRowConfig): PropertyDecorator {
  if (!config.dynamic && !config.components) {
    throw new Error('[V2DynamicRow] requires either `dynamic`+`items` or `components`.');
  }
  return (target, propertyKey) => {
    registerChild(target, String(propertyKey), {
      type: 'dynamicRow',
      config,
    });
  };
}
