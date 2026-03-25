import type { PrefixConfig } from '@spraxium/common';
import type { Constructor } from '@spraxium/common';
import type { Client } from 'discord.js';
import { PrefixGuildManager } from './guild';
import type { PrefixCommandInfo, ResolvedPrefixEntry } from './interfaces';
import { PrefixBinder } from './prefix.binder';
import { PrefixRegistry } from './prefix.registry';
export type { PrefixCommandInfo, ResolvedPrefixEntry } from './interfaces';

export class PrefixDispatcher {
  private readonly registry = new PrefixRegistry();
  private readonly binder = new PrefixBinder(this.registry);
  public readonly guildPrefixes = new PrefixGuildManager();

  public registerCommand(ctor: Constructor): void {
    this.registry.registerCommand(ctor);
  }

  public registerHandler(ctor: Constructor, instance: unknown): void {
    this.registry.registerHandler(ctor, instance);
  }

  public bind(client: Client, config: PrefixConfig): void {
    this.binder.bind(client, config, this.guildPrefixes);
  }

  public getResolved(): Array<ResolvedPrefixEntry> {
    return this.registry.getResolved();
  }

  public getCommandInfo(): Array<PrefixCommandInfo> {
    return this.registry.getCommandInfo();
  }

  public get size(): number {
    return this.registry.size;
  }

  public get commandCount(): number {
    return this.registry.commandCount;
  }

  public get cooldowns(): PrefixBinder['cooldowns'] {
    return this.binder.cooldowns;
  }
}
