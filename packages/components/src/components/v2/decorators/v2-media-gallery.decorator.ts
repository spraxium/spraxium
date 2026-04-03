import type { V2MediaGalleryConfig } from '../interfaces';
import { registerChild } from './register-child';

/**
 * Property decorator that registers a media gallery child within a V2 container.
 *
 * @param items Static array of gallery items or a factory receiving runtime data
 */
export function V2MediaGallery(items: V2MediaGalleryConfig['items']): PropertyDecorator {
  return (target, propertyKey) => {
    registerChild(target, String(propertyKey), {
      type: 'mediaGallery',
      config: { items } as V2MediaGalleryConfig,
    });
  };
}
