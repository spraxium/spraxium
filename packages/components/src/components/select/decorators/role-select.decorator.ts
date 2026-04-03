import 'reflect-metadata';
import { METADATA_KEYS } from '@spraxium/common';
import type { RoleSelectConfig, SelectComponentMeta } from '../interfaces';

/**
 * Class decorator that registers a role select menu component.
 *
 * @param config Custom ID, placeholder, and selection constraints
 */
export function RoleSelect(config: RoleSelectConfig): ClassDecorator {
  return (target): void => {
    Reflect.defineMetadata(
      METADATA_KEYS.SELECT_COMPONENT,
      { type: 'role', ...config } as SelectComponentMeta,
      target,
    );
  };
}
