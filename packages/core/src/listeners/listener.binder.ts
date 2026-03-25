import type { Client } from 'discord.js';
import type { HandlerEntry } from './interfaces';
import type { ListenerInvoker } from './listener.invoker';
import type { ListenerRegistry } from './listener.registry';

export class ListenerBinder {
  private readonly boundClients = new WeakSet<Client>();

  constructor(
    private readonly registry: ListenerRegistry,
    private readonly invoker: ListenerInvoker,
  ) {}

  public bind(client: Client): void {
    if (this.registry.size === 0 || this.boundClients.has(client)) return;
    this.boundClients.add(client);

    for (const [groupKey, groupHandlers] of this.groupHandlersByEvent()) {
      const { event, once } = this.parseGroupKey(groupKey);
      const register = once ? client.once.bind(client) : client.on.bind(client);

      register(event, (...discordArgs: Array<unknown>) => {
        void this.invoker.runGroup(groupHandlers, discordArgs);
      });
    }
  }

  private groupHandlersByEvent(): Map<string, Array<HandlerEntry>> {
    const groups = new Map<string, Array<HandlerEntry>>();

    for (const handler of this.registry.all()) {
      const key = `${handler.event}:${String(handler.once)}`;
      const group = groups.get(key) ?? [];
      group.push(handler);
      groups.set(key, group);
    }

    return groups;
  }

  private parseGroupKey(key: string): { event: string; once: boolean } {
    const separatorIndex = key.lastIndexOf(':');
    return {
      event: key.slice(0, separatorIndex),
      once: key.slice(separatorIndex + 1) === 'true',
    };
  }
}
