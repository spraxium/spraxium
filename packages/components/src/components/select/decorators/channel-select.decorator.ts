import 'reflect-metadata';
import { COMPONENT_METADATA_KEYS } from '../../../component-metadata-keys.constant';
import type { ChannelSelectConfig, SelectComponentMeta } from '../interfaces';

/**
 * Class decorator that registers a channel select menu component.
 *
 * @param config Custom ID, placeholder, channel type filters, and selection constraints
 */
export function ChannelSelect(config: ChannelSelectConfig): ClassDecorator {
  return (target): void => {
    const meta: SelectComponentMeta = {
      type: 'channel',
      customId: config.customId,
      placeholder: config.placeholder,
      minValues: config.minValues,
      maxValues: config.maxValues,
      disabled: config.disabled,
      channelTypes: config.channelTypes,
    };
    Reflect.defineMetadata(COMPONENT_METADATA_KEYS.SELECT_COMPONENT, meta, target);
  };
}
