import 'reflect-metadata';
import { COMPONENT_METADATA_KEYS } from '../component-metadata-keys.constant';

/**
 * Parameter decorator that injects the resolved payload bound to a
 * `@DynamicStringSelect`'s render call. The dispatcher fetches the payload via
 * the `~p:<id>` segment in the custom ID and passes it to the handler.
 */
export function SelectPayload(): ParameterDecorator {
  return (target: object, propertyKey: string | symbol | undefined, parameterIndex: number): void => {
    Reflect.defineMetadata(
      COMPONENT_METADATA_KEYS.SELECT_PAYLOAD_PARAM,
      parameterIndex,
      target,
      propertyKey ?? 'handle',
    );
  };
}
