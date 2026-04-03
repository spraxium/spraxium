import 'reflect-metadata';
import { METADATA_KEYS } from '@spraxium/common';

/**
 * Parameter decorator that injects the full select-menu interaction into a handler method.
 * Resolves to the raw `AnySelectMenuInteraction` received from Discord.
 *
 * @example
 * ```ts
 * @StringSelectHandler(TopicSelect)
 * class TopicHandler {
 *   handle(@Selected() interaction: StringSelectMenuInteraction) {
 *     const chosen = interaction.values[0];
 *   }
 * }
 * ```
 */
export function Selected(): ParameterDecorator {
  return (target: object, propertyKey: string | symbol | undefined, parameterIndex: number): void => {
    Reflect.defineMetadata(METADATA_KEYS.SELECTED_PARAM, parameterIndex, target, propertyKey ?? 'handle');
  };
}
