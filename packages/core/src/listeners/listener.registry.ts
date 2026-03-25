import 'reflect-metadata';
import { METADATA_KEYS } from '@spraxium/common';
import type { Constructor, HandlerEntry, ResolvedListenerEntry } from './interfaces';

export class ListenerRegistry {
  private readonly handlers: Array<HandlerEntry> = [];

  public register(ctor: Constructor, instance: unknown): void {
    const isListener = Reflect.getOwnMetadata(METADATA_KEYS.LISTENER, ctor) as boolean | undefined;
    if (!isListener) return;

    const event = Reflect.getOwnMetadata(METADATA_KEYS.LISTENER_EVENT, ctor) as string | undefined;
    if (!event) return;

    const persistentMethods: Array<string | symbol> =
      Reflect.getOwnMetadata(METADATA_KEYS.ON_EVENT, ctor) ?? [];
    for (const method of persistentMethods) {
      this.add({ ctor, event, instance, method, once: false });
    }

    const onceMethods: Array<string | symbol> = Reflect.getOwnMetadata(METADATA_KEYS.ONCE_EVENT, ctor) ?? [];
    for (const method of onceMethods) {
      this.add({ ctor, event, instance, method, once: true });
    }
  }

  private add(entry: HandlerEntry): void {
    const alreadyRegistered = this.handlers.some(
      (h) =>
        h.ctor === entry.ctor &&
        h.event === entry.event &&
        h.method === entry.method &&
        h.once === entry.once,
    );
    if (!alreadyRegistered) {
      this.handlers.push(entry);
    }
  }

  public all(): Array<HandlerEntry> {
    return this.handlers;
  }

  public getResolved(): Array<ResolvedListenerEntry> {
    return this.handlers.map((h) => ({
      className: h.ctor.name,
      event: h.event,
      method: String(h.method),
      once: h.once,
    }));
  }

  public get size(): number {
    return this.handlers.length;
  }
}
