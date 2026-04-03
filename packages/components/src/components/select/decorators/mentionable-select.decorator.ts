import 'reflect-metadata';
import { METADATA_KEYS } from '@spraxium/common';
import type { MentionableSelectConfig, SelectComponentMeta } from '../interfaces';

/**
 * Class decorator that registers a mentionable select menu component (users and roles).
 *
 * @param config Custom ID, placeholder, and selection constraints
 */
export function MentionableSelect(config: MentionableSelectConfig): ClassDecorator {
  return (target): void => {
    Reflect.defineMetadata(
      METADATA_KEYS.SELECT_COMPONENT,
      { type: 'mentionable', ...config } as SelectComponentMeta,
      target,
    );
  };
}
