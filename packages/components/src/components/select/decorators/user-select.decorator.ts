import 'reflect-metadata';
import { METADATA_KEYS } from '@spraxium/common';
import type { SelectComponentMeta, UserSelectConfig } from '../interfaces';

/**
 * Class decorator that registers a user select menu component.
 *
 * @param config Custom ID, placeholder, and selection constraints
 */
export function UserSelect(config: UserSelectConfig): ClassDecorator {
  return (target): void => {
    Reflect.defineMetadata(
      METADATA_KEYS.SELECT_COMPONENT,
      { type: 'user', ...config } as SelectComponentMeta,
      target,
    );
  };
}
