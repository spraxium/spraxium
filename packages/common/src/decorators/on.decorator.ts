import 'reflect-metadata';
import { METADATA_KEYS } from '../constants/metadata-keys.constant';

/**
 * Wires a method as a persistent event handler (client.on).
 * The event itself comes from @Listener() on the class.
 *
 * @example
 * @Listener(Events.MessageCreate)
 * export class MessageListener {
 *   @On()
 *   onMessage(message: Message) {
 *     console.log(message.content);
 *   }
 * }
 */
export function On(): MethodDecorator {
  return (target, propertyKey) => {
    const existing: Array<string | symbol> =
      Reflect.getOwnMetadata(METADATA_KEYS.ON_EVENT, target.constructor) ?? [];
    if (!existing.includes(propertyKey)) {
      Reflect.defineMetadata(METADATA_KEYS.ON_EVENT, [...existing, propertyKey], target.constructor);
    }
  };
}