import type { V2ThumbnailConfig } from '../interfaces';
import { registerChild } from './register-child.helper';

/**
 * Property decorator that registers a thumbnail child within a V2 container.
 *
 * @param config Thumbnail URL, optional description, and spoiler flag
 */
export function V2Thumbnail(config: V2ThumbnailConfig): PropertyDecorator {
  return (target, propertyKey) => {
    registerChild(target, String(propertyKey), { type: 'thumbnail', config });
  };
}
