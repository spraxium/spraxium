import 'reflect-metadata';
import { COMPONENT_METADATA_KEYS } from '../component-metadata-keys.constant';

/**
 * Parameter decorator that injects the resolved payload bound to a
 * `@DynamicStringSelect`'s render call. The dispatcher fetches the payload via
 * the `~p:<id>` segment in the custom ID and passes it to the handler.
 */
export function SelectPayload(): ParameterDecorator {
  return (target: object, propertyKey: string | symbol | undefined, parameterIndex: number): void => {
    const key = propertyKey ?? 'handle';
    const existing = Reflect.getMetadata(COMPONENT_METADATA_KEYS.SELECT_PAYLOAD_PARAM, target, key);
    if (existing !== undefined) {
      throw new Error('@SelectPayload() can only be used once per handler method.');
    }
    Reflect.defineMetadata(COMPONENT_METADATA_KEYS.SELECT_PAYLOAD_PARAM, parameterIndex, target, key);
  };
}
