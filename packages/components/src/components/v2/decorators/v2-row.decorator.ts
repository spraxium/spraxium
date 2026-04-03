import type { V2ActionRowConfig } from '../interfaces';
import { registerChild } from './register-child';

/**
 * Property decorator that registers an action row child within a V2 container.
 *
 * @param config Button or select menu components to include in the row
 */
export function V2Row(config: V2ActionRowConfig): PropertyDecorator {
  return (target, propertyKey) => {
    registerChild(target, String(propertyKey), { type: 'actionRow', config });
  };
}
