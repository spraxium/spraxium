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
        i18n: config.i18n,
      };

      Reflect.defineMetadata(METADATA_KEYS.SLASH_OPTION, [meta, ...existing], target, propertyKey);
    };
  };
}

/**
 * Injects a resolved slash command option value by name into a `handle()`
 * parameter. This is the unified replacement for the deprecated `@SlashOpt`
 * decorator. The option type is resolved at runtime by correlating `name`
 * with the matching `@SlashOption.*` declaration on the command class.
 *
 * Also acts as a builder namespace of method decorators (`@SlashOption.String`,
 * `@SlashOption.Integer`, etc.) for declaring options on a `@SlashCommand`.
 *
 * @param name - The option name as declared on the command class.
 *
 * @example Parameter injection (handler)
 * async handle(
 *   \@Ctx() interaction: ChatInputCommandInteraction,
 *   \@SlashOption('message') message: string,
 * ): Promise<void> {
 *   await interaction.reply(message);
 * }
 *
 * @example Option declaration (command)
 * \@SlashOption.String('message', { description: 'Text to echo', required: true })
 * build() {}
 */
function SlashOptionParam(name: string): ParameterDecorator {
  return (target: object, propertyKey: string | symbol | undefined, parameterIndex: number): void => {
    if (propertyKey === undefined) return;

    const existing: Array<{ index: number; name: string }> =
      Reflect.getMetadata(METADATA_KEYS.SLASH_OPT_PARAM, target, propertyKey) ?? [];

    Reflect.defineMetadata(
      METADATA_KEYS.SLASH_OPT_PARAM,
      [...existing, { index: parameterIndex, name }],
      target,
      propertyKey,
    );
  };
}

const SlashOptionBuilders = {
  /** Adds a `STRING` option. Supports `minLength`, `maxLength`, `choices`, and `autocomplete`. */
  String: createOptionDecorator<SlashStringOptionConfig>('STRING'),
  /** Adds an `INTEGER` (whole number) option. Supports `min`, `max`, `choices`, and `autocomplete`. */
  Integer: createOptionDecorator<SlashIntegerOptionConfig>('INTEGER'),
  /** Adds a `NUMBER` (decimal) option. Supports `min`, `max`, and `autocomplete`. */
  Number: createOptionDecorator<SlashNumberOptionConfig>('NUMBER'),
  /** Adds a `BOOLEAN` option. */
  Boolean: createOptionDecorator<SlashBaseOptionConfig>('BOOLEAN'),
  /** Adds a `USER` option, resolves to a Discord `User` object. */
  User: createOptionDecorator<SlashBaseOptionConfig>('USER'),
  /** Adds a `CHANNEL` option. Use `channelTypes` to restrict accepted channel types. */
  Channel: createOptionDecorator<SlashChannelOptionConfig>('CHANNEL'),
  /** Adds a `ROLE` option, resolves to a Discord `Role` object. */
  Role: createOptionDecorator<SlashBaseOptionConfig>('ROLE'),
  /** Adds a `MENTIONABLE` option, resolves to either a `User` or `Role`. */
  Mentionable: createOptionDecorator<SlashBaseOptionConfig>('MENTIONABLE'),
  /** Adds an `ATTACHMENT` option, resolves to a Discord `Attachment` object. */
  Attachment: createOptionDecorator<SlashBaseOptionConfig>('ATTACHMENT'),
} as const;

export const SlashOption = Object.assign(SlashOptionParam, SlashOptionBuilders);
