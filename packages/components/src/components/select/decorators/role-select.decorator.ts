import 'reflect-metadata';
import { COMPONENT_METADATA_KEYS } from '../../../component-metadata-keys.constant';
import type { RoleSelectConfig, SelectComponentMeta } from '../interfaces';

/**
 * Class decorator that registers a role select menu component.
 *
 * @param config Custom ID, placeholder, and selection constraints
 */
export function RoleSelect(config: RoleSelectConfig): ClassDecorator {
  return (target): void => {
    Reflect.defineMetadata(
      COMPONENT_METADATA_KEYS.SELECT_COMPONENT,
      { type: 'role', ...config } as SelectComponentMeta,
      target,
    );
  };
}
