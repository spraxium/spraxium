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
      const existing: Array<SlashOptionMetadata> =
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

/**
 * Namespace of method decorators for declaring Discord slash command options.
 *
 * Apply these to a method on a `@SlashCommand` class (or a `@SlashSubcommand`
 * method) to define the options that Discord will show to the user.
 * Use `@SlashOpt` on handler parameters to inject the resolved values.
 *
 * @example
 * \@SlashCommand({ name: 'echo', description: 'Repeat a message' })
 * export class EchoCommand {
 *   \@SlashOption.String('message', { description: 'Text to echo', required: true })
 *   \@SlashOption.Integer('times', { description: 'How many times', min: 1, max: 10 })
 *   build() {}
 * }
 */
export const SlashOption = {
  /** Adds a `STRING` option. Supports `minLength`, `maxLength`, `choices`, and `autocomplete`. */
  String: createOptionDecorator<SlashStringOptionConfig>('STRING'),
  /** Adds an `INTEGER` (whole number) option. Supports `min`, `max`, `choices`, and `autocomplete`. */
  Integer: createOptionDecorator<SlashIntegerOptionConfig>('INTEGER'),
  /** Adds a `NUMBER` (decimal) option. Supports `min`, `max`, and `autocomplete`. */
  Number: createOptionDecorator<SlashNumberOptionConfig>('NUMBER'),
  /** Adds a `BOOLEAN` option. */
  Boolean: createOptionDecorator<SlashBaseOptionConfig>('BOOLEAN'),
  /** Adds a `USER` option — resolves to a Discord `User` object. */
  User: createOptionDecorator<SlashBaseOptionConfig>('USER'),
  /** Adds a `CHANNEL` option. Use `channelTypes` to restrict which channel types are accepted. */
  Channel: createOptionDecorator<SlashChannelOptionConfig>('CHANNEL'),
  /** Adds a `ROLE` option — resolves to a Discord `Role` object. */
  Role: createOptionDecorator<SlashBaseOptionConfig>('ROLE'),
  /** Adds a `MENTIONABLE` option — resolves to either a `User` or `Role`. */
  Mentionable: createOptionDecorator<SlashBaseOptionConfig>('MENTIONABLE'),
  /** Adds an `ATTACHMENT` option — resolves to a Discord `Attachment` object. */
  Attachment: createOptionDecorator<SlashBaseOptionConfig>('ATTACHMENT'),
} as const;
