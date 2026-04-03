import 'reflect-metadata';
import { COMPONENT_METADATA_KEYS } from '../component-metadata-keys';

/**
 * Parameter decorator that injects the selected values (`string[]`) from a select-menu interaction.
 * Shorthand for `interaction.values` — avoids boilerplate in handlers.
 *
 * @example
 * ```ts
 * @StringSelectHandler(TopicSelect)
 * class TopicHandler {
 *   handle(@SelectedValues() values: string[]) {
 *     console.log('User picked:', values);
 *   }
 * }
 * ```
 */
export function SelectedValues(): ParameterDecorator {
  return (target: object, propertyKey: string | symbol | undefined, parameterIndex: number): void => {
    const key = propertyKey ?? 'handle';
    const existing: number[] =
      Reflect.getMetadata(COMPONENT_METADATA_KEYS.SELECT_SELECTED_VALUES_PARAM, target, key) ?? [];
    existing.push(parameterIndex);
    Reflect.defineMetadata(COMPONENT_METADATA_KEYS.SELECT_SELECTED_VALUES_PARAM, existing, target, key);
  };
}
