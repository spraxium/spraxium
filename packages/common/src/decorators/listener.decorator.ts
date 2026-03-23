import 'reflect-metadata';
import { type ClientEvents, Events } from 'discord.js';
import { METADATA_KEYS } from '../constants/metadata-keys.constant';

export { Events };

/** Union of all valid Discord.js client event names. */
export type DiscordEvent = keyof ClientEvents;

/**
 * Binds a class to a Discord event. Use @On() or @Once() on the methods
 * to register persistent or one-time handlers respectively.
 *
 * @example
 * @Listener(Events.MessageCreate)
 * export class MessageListener {
 *   @On()
 *   async onMessage(message: Message) {
 *     if (message.author.bot) return;
 *     console.log(message.content);
 *   }
 * }
 */
export function Listener(event: DiscordEvent): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(METADATA_KEYS.LISTENER, true, target);
    Reflect.defineMetadata(METADATA_KEYS.LISTENER_EVENT, event, target);
    Reflect.defineMetadata(METADATA_KEYS.INJECTABLE, true, target);
  };
}