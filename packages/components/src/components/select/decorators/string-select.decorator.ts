import 'reflect-metadata';
import { METADATA_KEYS } from '@spraxium/common';
import type { SelectComponentMeta, StringSelectConfig } from '../interfaces';

/**
 * Class decorator that registers a string select menu component.
 *
 * @param config Custom ID, placeholder, and option constraints
 */
export function StringSelect(config: StringSelectConfig): ClassDecorator {
  return (target): void => {
    const meta: SelectComponentMeta = { type: 'string', ...config };
    Reflect.defineMetadata(METADATA_KEYS.SELECT_COMPONENT, meta, target);
  };
}
