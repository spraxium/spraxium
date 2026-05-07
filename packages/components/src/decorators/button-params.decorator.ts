import 'reflect-metadata';
import { COMPONENT_METADATA_KEYS } from '../component-metadata-keys.constant';

/**
 * Parameter decorator that injects URL-decoded inline params from a
 * `@DynamicButton({ encoding: 'inline' })` custom ID.
 */
export function ButtonParams<
  T extends Record<string, string | number | boolean> = Record<string, string | number | boolean>,
>(): ParameterDecorator;
export function ButtonParams(): ParameterDecorator {
  return (target: object, propertyKey: string | symbol | undefined, parameterIndex: number): void => {
    const key = propertyKey ?? 'handle';
    const existing = Reflect.getMetadata(COMPONENT_METADATA_KEYS.BUTTON_PARAMS_PARAM, target, key);
    if (existing !== undefined) {
      throw new Error('@ButtonParams() can only be used once per handler method.');
    }
    Reflect.defineMetadata(COMPONENT_METADATA_KEYS.BUTTON_PARAMS_PARAM, parameterIndex, target, key);
  };
}
