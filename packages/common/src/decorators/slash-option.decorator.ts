import 'reflect-metadata';
import { METADATA_KEYS } from '../constants/metadata-keys.constant';
import type {
  SlashBaseOptionConfig,
  SlashChannelOptionConfig,
  SlashIntegerOptionConfig,
  SlashNumberOptionConfig,
  SlashOptionMetadata,
  SlashOptionType,
  SlashStringOptionConfig,
} from '../interfaces/slash-option-metadata.interface';

function createOptionDecorator<T extends SlashBaseOptionConfig>(
  type: SlashOptionType,
): (name: string, config: T) => MethodDecorator {
  return (name: string, config: T): MethodDecorator => {
    return (target: object, propertyKey: string | symbol): void => {
      const existing: SlashOptionMetadata[] =
        Reflect.getMetadata(METADATA_KEYS.SLASH_OPTION, target, propertyKey) ?? [];

      const meta: SlashOptionMetadata = {
        type,
        name,
        description: config.description,
        required: config.required ?? false,
        autocomplete: (config as SlashStringOptionConfig).autocomplete ?? false,
        minLength: (config as SlashStringOptionConfig).minLength,
        maxLength: (config as SlashStringOptionConfig).maxLength,
        min: (config as SlashIntegerOptionConfig).min ?? (config as SlashNumberOptionConfig).min,
        max: (config as SlashIntegerOptionConfig).max ?? (config as SlashNumberOptionConfig).max,
        choices: (config as SlashStringOptionConfig).choices,
        channelTypes: (config as SlashChannelOptionConfig).channelTypes,
      };

      Reflect.defineMetadata(METADATA_KEYS.SLASH_OPTION, [meta, ...existing], target, propertyKey);
    };
  };
}

export const SlashOption = {
  String: createOptionDecorator<SlashStringOptionConfig>('STRING'),
  Integer: createOptionDecorator<SlashIntegerOptionConfig>('INTEGER'),
  Number: createOptionDecorator<SlashNumberOptionConfig>('NUMBER'),
  Boolean: createOptionDecorator<SlashBaseOptionConfig>('BOOLEAN'),
  User: createOptionDecorator<SlashBaseOptionConfig>('USER'),
  Channel: createOptionDecorator<SlashChannelOptionConfig>('CHANNEL'),
  Role: createOptionDecorator<SlashBaseOptionConfig>('ROLE'),
  Mentionable: createOptionDecorator<SlashBaseOptionConfig>('MENTIONABLE'),
  Attachment: createOptionDecorator<SlashBaseOptionConfig>('ATTACHMENT'),
} as const;
