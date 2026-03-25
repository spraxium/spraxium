import type { Client } from 'discord.js';
import type { Constructor, ResolvedListenerEntry } from './interfaces';
import { ListenerBinder } from './listener.binder';
import { ListenerInvoker } from './listener.invoker';
import { ListenerRegistry } from './listener.registry';
export type { ResolvedListenerEntry } from './interfaces';

export class ListenerDispatcher {
  private readonly registry = new ListenerRegistry();
  private readonly invoker = new ListenerInvoker();
  private readonly binder = new ListenerBinder(this.registry, this.invoker);

  public registerListener(ctor: Constructor, instance: unknown): void {
    this.registry.register(ctor, instance);
  }

  public bind(client: Client): void {
    this.binder.bind(client);
  }

  public getResolved(): Array<ResolvedListenerEntry> {
    return this.registry.getResolved();
  }

  public get size(): number {
    return this.registry.size;
  }
}
