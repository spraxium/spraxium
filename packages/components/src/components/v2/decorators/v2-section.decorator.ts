import type { V2SectionConfig } from '../interfaces';
import { registerChild } from './register-child.helper';

/**
 * Property decorator that registers a section child within a V2 container.
 * Sections display text with an optional button or thumbnail.
 *
 * @param config Text content and optional button/thumbnail configuration
 */
export function V2Section(config: V2SectionConfig): PropertyDecorator {
  return (target, propertyKey) => {
    registerChild(target, String(propertyKey), { type: 'section', config });
  };
}
