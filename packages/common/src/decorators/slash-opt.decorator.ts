import 'reflect-metadata';
import { METADATA_KEYS } from '../constants/metadata-keys.constant';

/**
 * Parameter decorator that injects a resolved slash command option value
 * into a handler method parameter.
 *
 * Use this in `@SlashCommandHandler` methods alongside `@SlashOption.*`
 * decorators on the corresponding `@SlashCommand` method to receive the
 * typed value Discord provided.
 *
 * @param name - The option name as declared in `@SlashOption.*`.
 *
 * @example
 * \@SlashCommandHandler(EchoCommand)
 * export class EchoHandler {
 *   async build(
 *     interaction: ChatInputCommandInteraction,
 *     \@SlashOpt('message') message: string,
 *     \@SlashOpt('times') times: number,
 *   ) {
 *     await interaction.reply(message.repeat(times));
 *   }
 * }
 */
export function SlashOpt(name: string): ParameterDecorator {
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
