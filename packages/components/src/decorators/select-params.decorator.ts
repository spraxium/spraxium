import 'reflect-metadata';
import { COMPONENT_METADATA_KEYS } from '../component-metadata-keys.constant';

/**
 * Parameter decorator that injects URL-decoded inline params from a
 * `@DynamicStringSelect({ encoding: 'inline' })` custom ID.
 *
 * Using this decorator in a handler bound to a store-encoded select (the default)
 * will inject `undefined`. Use `@SelectPayload()` for store-encoded selects.
 *
 * @example
 * ```ts
 * @DynamicSelectHandler(AssignCategorySelect)
 * class AssignCategorySelectHandler {
 *   async handle(
 *     @SelectedValues() values: string[],
 *     @SelectParams() params: { source: string },
 *   ) { ... }
 * }
 * ```
 */
export function SelectParams(): ParameterDecorator {
  return (target: object, propertyKey: string | symbol | undefined, parameterIndex: number): void => {
    const key = propertyKey ?? 'handle';
    const existing = Reflect.getMetadata(COMPONENT_METADATA_KEYS.SELECT_PARAMS_PARAM, target, key);
    if (existing !== undefined) {
      throw new Error('@SelectParams() can only be used once per handler method.');
    }
    Reflect.defineMetadata(COMPONENT_METADATA_KEYS.SELECT_PARAMS_PARAM, parameterIndex, target, key);
  };
}
