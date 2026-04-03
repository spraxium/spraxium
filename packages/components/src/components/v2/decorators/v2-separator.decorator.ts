import type { V2SeparatorConfig } from '../interfaces';
import { registerChild } from './register-child.helper';

/**
 * Property decorator that registers a separator child within a V2 container.
 * Renders a horizontal divider with configurable spacing.
 *
 * @param config Optional divider visibility and spacing size
 */
export function V2Separator(config: V2SeparatorConfig = {}): PropertyDecorator {
  return (target, propertyKey) => {
    registerChild(target, String(propertyKey), {
      type: 'separator',
      config: { divider: true, ...config } satisfies V2SeparatorConfig,
    });
  };
}
