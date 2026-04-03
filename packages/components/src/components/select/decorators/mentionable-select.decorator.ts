import 'reflect-metadata';
import { COMPONENT_METADATA_KEYS } from '../../../component-metadata-keys';
import type { MentionableSelectConfig, SelectComponentMeta } from '../interfaces';

/**
 * Class decorator that registers a mentionable select menu component (users and roles).
 *
 * @param config Custom ID, placeholder, and selection constraints
 */
export function MentionableSelect(config: MentionableSelectConfig): ClassDecorator {
  return (target): void => {
    Reflect.defineMetadata(
      COMPONENT_METADATA_KEYS.SELECT_COMPONENT,
      { type: 'mentionable', ...config } as SelectComponentMeta,
      target,
    );
  };
}
