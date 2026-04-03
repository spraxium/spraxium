import 'reflect-metadata';
import { COMPONENT_METADATA_KEYS } from '../../../component-metadata-keys.constant';
import type { SelectComponentMeta, StringSelectConfig } from '../interfaces';

/**
 * Class decorator that registers a string select menu component.
 *
 * @param config Custom ID, placeholder, and option constraints
 */
export function StringSelect(config: StringSelectConfig): ClassDecorator {
  return (target): void => {
    const meta: SelectComponentMeta = { type: 'string', ...config };
    Reflect.defineMetadata(COMPONENT_METADATA_KEYS.SELECT_COMPONENT, meta, target);
  };
}
