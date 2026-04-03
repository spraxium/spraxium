import 'reflect-metadata';
import type { V2TextDisplayConfig } from '../interfaces';
import { registerChild } from './register-child';

/**
 * Marks a property as a text display child within a V2 container.
 *
 * @param content Static string, `DescriptionBuilder`, or a factory receiving runtime data.
 */
export function V2Text(content: V2TextDisplayConfig['content']): PropertyDecorator {
  return (target, propertyKey) => {
    registerChild(target, String(propertyKey), {
      type: 'textDisplay',
      config: { content } as V2TextDisplayConfig,
    });
  };
}
