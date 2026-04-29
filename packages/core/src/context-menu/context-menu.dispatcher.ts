import type { Constructor } from '@spraxium/common';
import type { Client, RESTPostAPIContextMenuApplicationCommandsJSONBody } from 'discord.js';
import { ContextMenuBinder } from './context-menu.binder';
import { ContextMenuRegistrar } from './context-menu.registrar';
import { ContextMenuRegistry } from './context-menu.registry';
import type { ResolvedContextMenuEntry } from './interfaces';

export class ContextMenuDispatcher {
  private readonly registry = new ContextMenuRegistry();
  private readonly binder = new ContextMenuBinder(this.registry);
  private readonly registrar = new ContextMenuRegistrar(this.registry);

  public registerCommand(ctor: Constructor): void {
    this.registry.registerCommand(ctor);
  }

  public registerHandler(ctor: Constructor, instance: unknown): void {
    this.registry.registerHandler(ctor, instance);
  }

  public bind(client: Client): void {
    this.binder.bind(client);
  }

  public buildPayloads(): Array<RESTPostAPIContextMenuApplicationCommandsJSONBody> {
    return this.registrar.buildPayloads();
  }

  public getResolved(): Array<ResolvedContextMenuEntry> {
    return this.registry.getResolved();
  }

  public get size(): number {
    return this.registry.size;
  }

  public get commandCount(): number {
    return this.registry.commandCount;
  }
}
