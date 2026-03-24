import 'reflect-metadata';
import { METADATA_KEYS } from '../constants/metadata-keys.constant';

/**
 * Wires a method as a one-time handler (client.once).
 * The event itself comes from @Listener() on the class.
 *
 * @example
 * @Listener(Events.ClientReady)
 * export class ReadyListener {
 *   @Once()
 *   onReady(client: Client<true>) {
 *     console.log(`Logged in as ${client.user.tag}`);
 *   }
 * }
 */
export function Once(): MethodDecorator {
  return (target, propertyKey) => {
    const existing: Array<string | symbol> =
      Reflect.getOwnMetadata(METADATA_KEYS.ONCE_EVENT, target.constructor) ?? [];
    if (!existing.includes(propertyKey)) {
      Reflect.defineMetadata(METADATA_KEYS.ONCE_EVENT, [...existing, propertyKey], target.constructor);
    }
  };
}
