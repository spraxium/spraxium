import 'reflect-metadata';
import { METADATA_KEYS } from '../constants/metadata-keys.constant';

/**
 * Injects the raw Discord event args into an @On() / @Once() method parameter.
 *
 * @example
 * @Listener(Events.MessageCreate)
 * export class MessageListener {
 *   @On()
 *   onMessage(@Ctx() message: Message) {
 *     console.log(message.content);
 *   }
 * }
 */
export function Ctx(): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    if (propertyKey !== undefined) {
      Reflect.defineMetadata(METADATA_KEYS.CTX_PARAM, parameterIndex, target, propertyKey);
    }
  };
}
