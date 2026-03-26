import type { Constructor } from '@spraxium/common';
import type { Client } from 'discord.js';
import type { ResolvedSlashEntry } from './interfaces';
import { SlashBinder } from './slash.binder';
import { SlashRegistrar } from './slash.registrar';
import { SlashRegistry } from './slash.registry';
export type { ResolvedSlashEntry } from './interfaces';

export class SlashDispatcher {
  private readonly registry = new SlashRegistry();
  private readonly binder = new SlashBinder(this.registry);
  private readonly registrar = new SlashRegistrar(this.registry);

  public registerCommand(ctor: Constructor): void {
    this.registry.registerCommand(ctor);
  }

  public registerHandler(ctor: Constructor, instance: unknown): void {
    this.registry.registerHandler(ctor, instance);
  }

  public registerAutocompleteHandler(ctor: Constructor, instance: unknown): void {
    this.registry.registerAutocompleteHandler(ctor, instance);
  }

  public bind(client: Client): void {
    this.binder.bind(client);
  }

  public async register(token: string, clientId: string, guildId?: string, force = false): Promise<void> {
    await this.registrar.register(token, clientId, guildId, force);
  }

  public buildPayloads(): ReturnType<SlashRegistrar['buildPayloads']> {
    return this.registrar.buildPayloads();
  }

  public getResolved(): Array<ResolvedSlashEntry> {
    return this.registry.getResolved();
  }

  public get size(): number {
    return this.registry.size;
  }

  public get commandCount(): number {
    return this.registry.commandCount;
  }
}
