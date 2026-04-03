import type { V2FileConfig } from '../interfaces';
import { registerChild } from './register-child';

/**
 * Property decorator that registers a file attachment child within a V2 container.
 *
 * @param config File URL and optional spoiler flag
 */
export function V2File(config: V2FileConfig): PropertyDecorator {
  return (target, propertyKey) => {
    registerChild(target, String(propertyKey), { type: 'file', config });
  };
}
